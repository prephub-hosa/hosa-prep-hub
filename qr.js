/* ═════════════════════════════════════════════════════════════════
   Minimal QR encoder — byte mode, error correction level M,
   versions 1–10 (enough for any join link we generate).

   Self-contained on purpose. The main use is a founder projecting a
   code at a chapter meeting, and school networks block CDNs often
   enough that a remote dependency would fail exactly when it matters.

   Every table here is computed rather than transcribed (format info
   and version info via BCH, ECC via Reed-Solomon over GF(256)) so
   there are no copied-by-hand constants to get wrong.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ── GF(256), primitive polynomial 0x11D ──────────────────────────
  var EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x; LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11D;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();
  function mul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  // Generator polynomial for `deg` ECC codewords.
  function genPoly(deg) {
    var p = [1];
    for (var i = 0; i < deg; i++) {
      var np = new Array(p.length + 1).fill(0);
      // Coefficients are kept in descending order, so multiplying by
      // (x + a^i) shifts p[j] to np[j] and the constant term to np[j+1].
      // Having these two swapped produced a reversed generator, which is
      // self-consistent enough to look right and decodes as garbage.
      for (var j = 0; j < p.length; j++) {
        np[j] ^= p[j];
        np[j + 1] ^= mul(p[j], EXP[i]);
      }
      p = np;
    }
    return p;
  }

  function ecc(data, deg) {
    var g = genPoly(deg), res = new Array(deg).fill(0);
    for (var i = 0; i < data.length; i++) {
      var f = data[i] ^ res[0];
      res.shift(); res.push(0);
      if (f !== 0) for (var j = 0; j < deg; j++) res[j] ^= mul(g[j + 1], f);
    }
    return res;
  }

  // ── Per-version structure for ECC level M ────────────────────────
  // [total codewords, ecc codewords per block, group1 blocks, group2 blocks]
  var SPEC = {
    1:  [26,   10, 1, 0],
    2:  [44,   16, 1, 0],
    3:  [70,   26, 1, 0],
    4:  [100,  18, 2, 0],
    5:  [134,  24, 2, 0],
    6:  [172,  16, 4, 0],
    7:  [196,  18, 4, 0],
    8:  [242,  22, 2, 2],
    9:  [292,  22, 3, 2],
    10: [346,  26, 4, 1]
  };
  var ALIGN = {
    1: [], 2: [6,18], 3: [6,22], 4: [6,26], 5: [6,30],
    6: [6,34], 7: [6,22,38], 8: [6,24,42], 9: [6,26,46], 10: [6,28,50]
  };

  function dataCodewords(v) { return SPEC[v][0] - SPEC[v][1] * (SPEC[v][2] + SPEC[v][3]); }
  function capacityBytes(v) { return dataCodewords(v) - (v < 10 ? 2 : 3); }

  function bchFormat(fmt) {              // BCH(15,5), generator 0x537
    var d = fmt << 10;
    for (var i = 4; i >= 0; i--) if (d & (1 << (i + 10))) d ^= 0x537 << i;
    return ((fmt << 10) | d) ^ 0x5412;   // mask pattern from the spec
  }
  function bchVersion(v) {               // BCH(18,6), generator 0x1F25
    var d = v << 12;
    for (var i = 5; i >= 0; i--) if (d & (1 << (i + 12))) d ^= 0x1F25 << i;
    return (v << 12) | d;
  }

  var MASKS = [
    function (r, c) { return (r + c) % 2 === 0; },
    function (r)    { return r % 2 === 0; },
    function (r, c) { return c % 3 === 0; },
    function (r, c) { return (r + c) % 3 === 0; },
    function (r, c) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; },
    function (r, c) { return (r * c) % 2 + (r * c) % 3 === 0; },
    function (r, c) { return ((r * c) % 2 + (r * c) % 3) % 2 === 0; },
    function (r, c) { return ((r + c) % 2 + (r * c) % 3) % 2 === 0; }
  ];

  function encode(text) {
    var bytes = [], i;
    // UTF-8, so a stray smart quote in a URL can't corrupt the payload.
    var enc = unescape(encodeURIComponent(String(text)));
    for (i = 0; i < enc.length; i++) bytes.push(enc.charCodeAt(i) & 0xff);

    var version = 0;
    for (var v = 1; v <= 10; v++) if (bytes.length <= capacityBytes(v)) { version = v; break; }
    if (!version) throw new Error('QR: payload too long (' + bytes.length + ' bytes)');

    var size = version * 4 + 17;
    var spec = SPEC[version], eccLen = spec[1], g1 = spec[2], g2 = spec[3];
    var totalBlocks = g1 + g2;
    var dcw = dataCodewords(version);
    var g1len = Math.floor(dcw / totalBlocks), g2len = g1len + 1;

    // ── Bit stream: mode, length, payload, terminator, pad ─────────
    var bits = [];
    function push(val, len) { for (var k = len - 1; k >= 0; k--) bits.push((val >> k) & 1); }
    push(4, 4);                                   // byte mode
    push(bytes.length, version < 10 ? 8 : 16);
    for (i = 0; i < bytes.length; i++) push(bytes[i], 8);
    for (i = 0; i < 4 && bits.length < dcw * 8; i++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    var cw = [];
    for (i = 0; i < bits.length; i += 8) {
      var b = 0;
      for (var k = 0; k < 8; k++) b = (b << 1) | bits[i + k];
      cw.push(b);
    }
    var pad = [0xEC, 0x11], pi = 0;
    while (cw.length < dcw) cw.push(pad[pi++ % 2]);

    // ── Split into blocks, compute ECC, interleave ─────────────────
    var blocks = [], eccBlocks = [], off = 0;
    for (i = 0; i < totalBlocks; i++) {
      var len = i < g1 ? g1len : g2len;
      var blk = cw.slice(off, off + len); off += len;
      blocks.push(blk); eccBlocks.push(ecc(blk, eccLen));
    }
    var out = [];
    for (i = 0; i < g2len; i++)
      for (var b2 = 0; b2 < totalBlocks; b2++)
        if (i < blocks[b2].length) out.push(blocks[b2][i]);
    for (i = 0; i < eccLen; i++)
      for (var b3 = 0; b3 < totalBlocks; b3++) out.push(eccBlocks[b3][i]);

    // ── Module matrix ──────────────────────────────────────────────
    var m = [], reserved = [];
    for (i = 0; i < size; i++) { m.push(new Array(size).fill(0)); reserved.push(new Array(size).fill(0)); }
    function setF(r, c, v2) { m[r][c] = v2; reserved[r][c] = 1; }

    function finder(r, c) {
      for (var dr = -1; dr <= 7; dr++) for (var dc = -1; dc <= 7; dc++) {
        var rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        var on = (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
                 (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6)) ||
                 (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
        setF(rr, cc, on ? 1 : 0);
      }
    }
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

    for (i = 8; i < size - 8; i++) {              // timing
      setF(6, i, i % 2 === 0 ? 1 : 0);
      setF(i, 6, i % 2 === 0 ? 1 : 0);
    }
    var ac = ALIGN[version];
    for (i = 0; i < ac.length; i++) for (var j2 = 0; j2 < ac.length; j2++) {
      var ar = ac[i], acc = ac[j2];
      if ((ar <= 8 && acc <= 8) || (ar <= 8 && acc >= size - 9) || (ar >= size - 9 && acc <= 8)) continue;
      for (var dr2 = -2; dr2 <= 2; dr2++) for (var dc2 = -2; dc2 <= 2; dc2++)
        setF(ar + dr2, acc + dc2,
             (Math.abs(dr2) === 2 || Math.abs(dc2) === 2 || (dr2 === 0 && dc2 === 0)) ? 1 : 0);
    }
    setF(size - 8, 8, 1);                          // dark module

    // Reserve format areas (filled after masking).
    for (i = 0; i < 9; i++) { if (!reserved[8][i]) setF(8, i, 0); if (!reserved[i][8]) setF(i, 8, 0); }
    for (i = 0; i < 8; i++) { if (!reserved[8][size - 1 - i]) setF(8, size - 1 - i, 0); if (!reserved[size - 1 - i][8]) setF(size - 1 - i, 8, 0); }
    if (version >= 7) {
      for (i = 0; i < 6; i++) for (var j3 = 0; j3 < 3; j3++) {
        setF(size - 11 + j3, i, 0); setF(i, size - 11 + j3, 0);
      }
    }

    // ── Place data, zig-zag from bottom right ──────────────────────
    var bi = 0, dirUp = true;
    for (var col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;                        // skip the timing column
      for (var t = 0; t < size; t++) {
        var row = dirUp ? size - 1 - t : t;
        for (var s = 0; s < 2; s++) {
          var cc2 = col - s;
          if (reserved[row][cc2]) continue;
          var bit = 0;
          if (bi < out.length * 8) bit = (out[bi >> 3] >> (7 - (bi & 7))) & 1;
          bi++;
          m[row][cc2] = bit;
        }
      }
      dirUp = !dirUp;
    }

    // ── Choose the mask with the lowest penalty ────────────────────
    function penalty(g) {
      var p = 0, r, c, run, i2, dark = 0;
      for (r = 0; r < size; r++) {
        run = 1;
        for (c = 1; c < size; c++) {
          if (g[r][c] === g[r][c - 1]) { run++; } else { if (run >= 5) p += 3 + (run - 5); run = 1; }
        }
        if (run >= 5) p += 3 + (run - 5);
      }
      for (c = 0; c < size; c++) {
        run = 1;
        for (r = 1; r < size; r++) {
          if (g[r][c] === g[r - 1][c]) { run++; } else { if (run >= 5) p += 3 + (run - 5); run = 1; }
        }
        if (run >= 5) p += 3 + (run - 5);
      }
      for (r = 0; r < size - 1; r++) for (c = 0; c < size - 1; c++) {
        var v3 = g[r][c];
        if (v3 === g[r][c + 1] && v3 === g[r + 1][c] && v3 === g[r + 1][c + 1]) p += 3;
      }
      var pat1 = [1,0,1,1,1,0,1,0,0,0,0], pat2 = [0,0,0,0,1,0,1,1,1,0,1];
      function match(arr, pat) {
        for (var q = 0; q < pat.length; q++) if (arr[q] !== pat[q]) return false;
        return true;
      }
      for (r = 0; r < size; r++) for (c = 0; c <= size - 11; c++) {
        var hs = g[r].slice(c, c + 11);
        if (match(hs, pat1) || match(hs, pat2)) p += 40;
      }
      for (c = 0; c < size; c++) for (r = 0; r <= size - 11; r++) {
        var vs = []; for (i2 = 0; i2 < 11; i2++) vs.push(g[r + i2][c]);
        if (match(vs, pat1) || match(vs, pat2)) p += 40;
      }
      for (r = 0; r < size; r++) for (c = 0; c < size; c++) if (g[r][c]) dark++;
      p += Math.floor(Math.abs(dark * 100 / (size * size) - 50) / 5) * 10;
      return p;
    }

    var best = null, bestP = Infinity, bestMask = -1;
    for (var mk = 0; mk < 8; mk++) {
      var g4 = m.map(function (row2) { return row2.slice(); });
      for (var r4 = 0; r4 < size; r4++) for (var c4 = 0; c4 < size; c4++)
        if (!reserved[r4][c4] && MASKS[mk](r4, c4)) g4[r4][c4] ^= 1;

      var fmt = bchFormat((0 << 3) | mk);          // 0b00 = level M
      for (var i5 = 0; i5 < 15; i5++) {
        var bit5 = (fmt >> i5) & 1;
        if (i5 < 6)       g4[i5][8] = bit5;
        else if (i5 === 6) g4[7][8] = bit5;
        else if (i5 === 7) g4[8][8] = bit5;
        else if (i5 === 8) g4[8][7] = bit5;
        else               g4[8][14 - i5] = bit5;
        if (i5 < 8)        g4[8][size - 1 - i5] = bit5;
        else               g4[size - 15 + i5][8] = bit5;
      }
      g4[size - 8][8] = 1;
      if (version >= 7) {
        var vi = bchVersion(version);
        for (var i6 = 0; i6 < 18; i6++) {
          var b6 = (vi >> i6) & 1;
          g4[Math.floor(i6 / 3)][size - 11 + (i6 % 3)] = b6;
          g4[size - 11 + (i6 % 3)][Math.floor(i6 / 3)] = b6;
        }
      }
      var pen = penalty(g4);
      if (pen < bestP) { bestP = pen; best = g4; bestMask = mk; }
    }
    return { size: size, modules: best, version: version, mask: bestMask };
  }

  /** Render to a canvas. `scale` px per module, `quiet` modules of margin. */
  function toCanvas(canvas, text, opts) {
    opts = opts || {};
    var q = opts.quiet == null ? 4 : opts.quiet;
    var qr = encode(text);
    var scale = opts.scale || Math.max(2, Math.floor((opts.size || 320) / (qr.size + q * 2)));
    var px = (qr.size + q * 2) * scale;
    canvas.width = px; canvas.height = px;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = opts.light || '#ffffff';
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = opts.dark || '#111111';
    for (var r = 0; r < qr.size; r++) for (var c = 0; c < qr.size; c++)
      if (qr.modules[r][c]) ctx.fillRect((c + q) * scale, (r + q) * scale, scale, scale);
    return qr;
  }

  global.HosaQR = { encode: encode, toCanvas: toCanvas, capacityBytes: capacityBytes };
})(typeof window !== 'undefined' ? window : this);
