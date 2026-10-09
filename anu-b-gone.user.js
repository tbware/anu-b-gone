// ==UserScript==
// @name         anu-b-gone
// @namespace    local
// @version      1.0
// @description  NO MORE. ANUBIS. TY.
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const asset_path = "/.within.website/x/cmd/anubis/";
    const pass_path = asset_path + "api/pass-challenge";
    const mascot_path = asset_path + "static/img/";
    const id_challenge = "anubis_challenge";
    const id_prefix = "anubis_base_prefix";
    const hide_id = "hide-anubis";
    const reveal_ms = 5000;
    let acted = false;

    function dom_json(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        try {
            return JSON.parse(el.textContent);
        } catch (e) {
            return null;
        }
    }

    function style_add(css) {
        const el = document.createElement("style");
        el.textContent = css;
        (document.head || document.documentElement).appendChild(el);
        return el;
    }

    function mascot_mask() {
        style_add('img[src*="' + mascot_path + '"]{display:none!important}');
    }

    function hide() {
        if (document.getElementById(hide_id)) return;
        style_add("html{visibility:hidden!important}").id = hide_id;
    }

    function reveal() {
        const el = document.getElementById(hide_id);
        if (el) el.remove();
    }

    function is_anubis() {
        if (document.getElementById(id_challenge)) return true;
        if (document.querySelector('[id^="anubis"]')) return true;
        return !!document.querySelector(
            '[src*="' + asset_path + '" i],[href*="' + asset_path + '" i]');
    }

    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b,
        0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
        0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7,
        0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
        0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152,
        0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
        0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
        0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
        0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
        0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
        0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    function rotr(x, n) {
        return (x >>> n) | (x << (32 - n));
    }

    function sha256_hex(bytes) {
        const h = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
            0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
        ];
        const len = bytes.length;
        const bitlen = len * 8;
        const total = ((len + 8) >> 6) + 1;
        const msg = new Uint8Array(total * 64);
        msg.set(bytes);
        msg[len] = 0x80;
        const dv = new DataView(msg.buffer);
        dv.setUint32(msg.length - 4, bitlen >>> 0, false);
        dv.setUint32(msg.length - 8, Math.floor(bitlen / 0x100000000), false);

        const w = new Uint32Array(64);
        let i, j, t1, t2, a, b, c, d, e, f, g, hh;
        for (i = 0; i < msg.length; i += 64) {
            for (j = 0; j < 16; j++) {
                w[j] = dv.getUint32(i + j * 4, false);
            }
            for (j = 16; j < 64; j++) {
                const s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^
                           (w[j - 15] >>> 3);
                const s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^
                           (w[j - 2] >>> 10);
                w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
            }
            a = h[0]; b = h[1]; c = h[2]; d = h[3];
            e = h[4]; f = h[5]; g = h[6]; hh = h[7];
            for (j = 0; j < 64; j++) {
                const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
                const chh = (e & f) ^ (~e & g);
                t1 = (hh + S1 + chh + K[j] + w[j]) >>> 0;
                const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
                const maj = (a & b) ^ (a & c) ^ (b & c);
                t2 = (S0 + maj) >>> 0;
                hh = g; g = f; f = e;
                e = (d + t1) >>> 0;
                d = c; c = b; b = a;
                a = (t1 + t2) >>> 0;
            }
            h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0;
            h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
            h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0;
            h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
        }
        let out = "";
        for (i = 0; i < 8; i++) {
            out += h[i].toString(16).padStart(8, "0");
        }
        return out;
    }

    function pow_solve(data, difficulty) {
        const enc = new TextEncoder();
        let nonce = 0;
        for (;;) {
            const hex = sha256_hex(enc.encode(data + nonce));
            let good = true;
            for (let i = 0; i < difficulty; i++) {
                if (hex[i] !== "0") { good = false; break; }
            }
            if (good) return { hash: hex, nonce: nonce };
            nonce++;
        }
    }

    function pass_url(challenge, prefix, result, elapsed_ms) {
        const url = new URL(location.origin + prefix + pass_path);
        url.searchParams.set("id", challenge.id);
        url.searchParams.set("response", result.hash);
        url.searchParams.set("nonce", String(result.nonce));
        url.searchParams.set("redir", location.pathname + location.search);
        url.searchParams.set("elapsedTime", String(elapsed_ms));
        return url.toString();
    }

    function challenge_solve() {
        const payload = dom_json(id_challenge);
        if (!payload) return false;
        const challenge = payload.challenge;
        const rules = payload.rules;
        if (!challenge || !rules ||
                typeof challenge.randomData !== "string") return false;

        acted = true;
        hide();

        const prefix = dom_json(id_prefix) || "";
        const started = performance.now();
        const result = pow_solve(challenge.randomData, rules.difficulty);
        const elapsed = performance.now() - started;

        location.replace(pass_url(challenge, prefix, result, elapsed));
        return true;
    }

    function scan() {
        if (acted) return true;
        if (is_anubis()) hide();
        return challenge_solve();
    }

    mascot_mask();

    const observer = new MutationObserver(function () {
        if (scan()) observer.disconnect();
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    document.addEventListener("DOMContentLoaded", function () {
        scan();
        observer.disconnect();
        if (!acted) setTimeout(reveal, reveal_ms);
    });
})();
