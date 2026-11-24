import {clueCardIconShape} from './clue-card-art.js';
import {ITEM_SHAPES} from './game-items.js';
// One source for briefing and gameplay icons; no font-dependent glyphs.
const shapes={...ITEM_SHAPES,
 score:'<path d="M12 5h16v10c0 7-16 7-16 0ZM12 9H5v5c0 5 7 7 10 6M28 9h7v5c0 5-7 7-10 6M20 22v9M13 35h14M15 31h10"/>',
 backpack:'<path d="M12 11V8c0-6 16-6 16 0v3M8 12c0-4 24-4 24 0v22H8ZM13 24h14v8H13ZM7 17H4v12h4m24-12h4v12h-4M17 16h6"/>',
 howto:'<rect x="4" y="7" width="32" height="25" rx="6"/><path d="m17 14 10 6-10 6ZM12 36h16"/>',
 restart:'<path d="M9 15a13 13 0 1 1-1 12M9 5v11H0"/>',
 pocket:'<path d="M9 8h22v20l-11 8L9 28ZM9 14h22M17 23h6"/>',
 filmInfo:'<rect x="5" y="7" width="30" height="26" rx="4" fill="#f1d9a1" stroke="#8e805c"/><path d="M5 13h30M5 27h30M11 8v5m8-5v5m8-5v5M11 27v6m8-6v6m8-6v6" stroke="#9b8b63"/><path d="m18 17 7 3-7 4Z" fill="#5a8e80"/>',
 virusClear:'<path d="M8 9 5 6m27 3 3-3M7 20H3m30 0h4M9 31l-4 4m26-4 4 4M20 6V2m0 32v4" stroke="#aa765e" stroke-width="2"/><circle cx="20" cy="20" r="12" fill="#cf9573" stroke="#966e57" stroke-width="1.5"/><circle cx="16" cy="17" r="2" fill="#875f50"/><circle cx="24" cy="23" r="2.5" fill="#875f50"/><path d="m11 31 20-22" stroke="#fff7df" stroke-width="6" stroke-linecap="round"/><path d="m11 31 20-22" stroke="#56947f" stroke-width="3" stroke-linecap="round"/>',
 bookSupport:'<rect x="5" y="8" width="30" height="27" rx="4" fill="#afccbb" stroke="#638b78"/><path d="M20 14v15m0-12c-4-3-8-3-11-1v11c4-1 7-1 11 2 4-3 7-3 11-2V16c-3-2-7-2-11 1Z" fill="#fae8b7" stroke="#8e815e"/><path d="m29 4 3 3 5-5" fill="none" stroke="#568b78" stroke-width="2"/>',

 gardenerBell:'<path d="M17 8V5a3 3 0 0 1 6 0v3" fill="none" stroke="#8a744c" stroke-width="2"/><path d="M11 27c3-4 2-7 3-13 1-8 11-8 12 0 1 6 0 9 3 13Z" fill="#dfba72" stroke="#8c774c" stroke-width="1.5"/><path d="M9 28h22M16 30c0 7 8 7 8 0M7 9 3 6M33 9l4-3M5 18H1M35 18h4" fill="none" stroke="#679083" stroke-width="2" stroke-linecap="round"/>',

 flower:'<path d="M20 24v13m0-5c-9 1-13-4-13-8 6-1 11 2 13 8Z" fill="#a8c49a" stroke="#638f73"/><path d="M20 8c-8-13-17 0-7 7-14 1-8 16 3 9 0 14 16 11 12-2 13 5 16-11 3-13 4-12-9-17-11-1Z" fill="#e7b7af" stroke="#b08679"/><circle cx="22" cy="17" r="6" fill="#e8c475"/>',
 sprayer:'<path d="M12 14h14v6H12Z" fill="#d5d7b6"/><path d="M10 4h23v6H21v8h-9V9H7Z" fill="#9db995" stroke="#618c73"/><path d="M14 17h12l6 8v12H8V25Z" fill="#b0cbaa" stroke="#618c73"/><path d="M35 6h3m-4 5 3 2M13 28h14" stroke="#e7d8ad" stroke-width="2"/>',
 tripod:'<path d="M20 19v17M20 22 7 37M20 22l13 15" stroke="#557a77" stroke-width="3"/><rect x="9" y="6" width="22" height="15" rx="3" fill="#c5d8c8" stroke="#6e8e80"/><path d="M13 6V3h8v3" stroke="#8e815d"/><circle cx="21" cy="13" r="5" fill="#85b5b3" stroke="#587d82"/><circle cx="21" cy="13" r="2.5" fill="#d9eee0"/>',
 thermostat:'<rect x="6" y="3" width="28" height="34" rx="7" fill="#a9cbbb" stroke="#608f7b"/><path d="M17 11a3 3 0 0 1 6 0v13a6 6 0 1 1-6 0Z" fill="#fff1cb" stroke="#6b927b"/><path d="M20 14v15" stroke="#d89f61" stroke-width="3"/><circle cx="20" cy="29" r="3" fill="#d89f61"/><path d="M26 13h4m-4 5h3" stroke="#6b927b"/>',
 wateringCan:'<path d="M8 17h19v16H8Z" fill="#b0cbb0" stroke="#638b70"/><path d="M11 17v-7c0-7 13-7 13 0v7M27 21l8-9 3 3-9 13M8 21c-8-4-8 9 0 7" fill="none" stroke="#6c937d" stroke-width="3"/><path d="m34 11 5 5M16 21v8m-4-4h8" stroke="#fff4cb" stroke-width="2"/>',
 decoy:'<ellipse cx="18" cy="25" rx="12" ry="7" fill="#adbcb0" stroke="#627c74"/><circle cx="29" cy="22" r="5" fill="#cfba93" stroke="#7a725f"/><circle cx="31" cy="20" r="1" fill="#405554"/><path d="M6 25Q0 16 6 11M16 18v-5m-3-2h6v4h-6Z" stroke="#8c7958"/>',
 remote:'<rect x="10" y="8" width="20" height="29" rx="5" fill="#b5cbbb" stroke="#6b8d7a"/><rect x="14" y="12" width="12" height="8" rx="2" fill="#f6e6b7" stroke="#9d8d68"/><path d="M17 14v4M23 14v4" stroke="#688878"/><circle cx="16" cy="26" r="2" fill="#daaa8d"/><circle cx="24" cy="26" r="2" fill="#edd4a2"/><path d="M16 32h8M15 5q5-5 10 0M18 4q2-2 4 0" stroke="#6b8d7a"/>',
 oven:'<rect x="4" y="8" width="32" height="28" rx="4" fill="#afc4aa" stroke="#6a8670"/><rect x="8" y="17" width="24" height="14" rx="2" fill="#f4d498" stroke="#9b845a"/><path d="M9 13h15M12 25h16M9 36v2M31 36v2" stroke="#856c4c"/><circle cx="29" cy="12" r="2" fill="#e8c28b"/>',
 neural:'<path d="m6 23 7-14 10-4 11 12-5 15-13 2Z" stroke="#498992"/><path d="m6 23 17-18 6 27-16-23 21 8-18 17"/><g fill="#9ee0d5"><circle cx="6" cy="23" r="3"/><circle cx="13" cy="9" r="3"/><circle cx="23" cy="5" r="3"/><circle cx="34" cy="17" r="3"/><circle cx="29" cy="32" r="3"/></g>',
 robot:'<rect x="6" y="11" width="28" height="23" rx="6" fill="#afd0ca"/><path d="M20 11V5M13 27h14"/><circle cx="13" cy="20" r="2"/><circle cx="27" cy="20" r="2"/>',
 card:clueCardIconShape(),
 autoCamera:'<rect x="8" y="12" width="26" height="20" rx="4" fill="#c5d8c8" stroke="#6e8e80"/><path d="M13 12V8h9v4" fill="#dfca92" stroke="#8e815d"/><circle cx="23" cy="22" r="6" fill="#85b5b3" stroke="#587d82"/><circle cx="23" cy="22" r="3" fill="#e5f1df"/><path d="M7 29C0 25 0 13 9 8m-1 0-1 6m1-6-6 1" fill="none" stroke="#c99c4c" stroke-width="2.5" stroke-linecap="round"/>',
 feed:'<path d="M5 30c5 5 11 5 18 0l10-9c2-3-1-5-3-3l-9 6" fill="#ebc499" stroke="#927353"/><path d="M3 28l7-8c2-2 4-2 6 0l5 4c2 3-1 5-3 3l-4-3" fill="#f0d2ac" stroke="#927353"/><path d="M22 13c-8-10-13-1-4 3 9 3 12-5 4-3Z" fill="#91ae69" stroke="#68874f"/><path d="m23 9 3-5M29 13l6-3" stroke="#c1a76d"/>',
 whistle:'<path d="m21 12 13-7 3 6-12 7" fill="#dcb46e" stroke="#987744"/><path d="M24 16a12 12 0 1 1-9-5h8Z" fill="#ecc67d" stroke="#947c4f"/><circle cx="13" cy="23" r="5" fill="#ab905c" stroke="#f4dda2"/><path d="m29 19 7 2M26 25l5 6" stroke="#6f9c8d"/>',

 brake:'<path d="M12 30v7h16v-7" stroke="#707e77"/><rect x="6" y="5" width="28" height="25" rx="5" fill="#ae8d65" stroke="#705e46"/><path d="M12 10v14M20 10v14M28 10v14" stroke="#f5e1ad" stroke-width="3"/>',
 bumper:'<path d="M20 3 35 9v12c0 9-15 16-15 16S5 30 5 21V9Z" fill="#80b5a7" stroke="#527e71"/><path d="m11 21 3-7h12l3 7v7H11Z" fill="#efce86" stroke="#947951"/><path d="M13 22h14M15 16h10" stroke="#806e51"/><circle cx="15" cy="26" r="2" fill="#5c6a65"/><circle cx="25" cy="26" r="2" fill="#5c6a65"/>',

 camera:'<path d="M12 11 15 6h10l3 5" stroke="#697e76"/><rect x="3" y="11" width="34" height="24" rx="5" fill="#80aca4" stroke="#466d66"/><circle cx="20" cy="23" r="9" fill="#e6dfbd" stroke="#466d66"/><circle cx="20" cy="23" r="5" fill="#376c76"/><path d="M29 16h4" stroke="#fff3d6"/>',
 autoChip:'<path d="M12 3v5m8-5v5m8-5v5M12 32v5m8-5v5m8-5v5M3 12h5m-5 8h5m-5 8h5m24-16h5m-5 8h5m-5 8h5" stroke="#b8cdb9" stroke-width="2.5"/><rect x="7" y="7" width="26" height="26" rx="5" fill="#466e73" stroke="#d5e9cb"/><rect x="11" y="11" width="18" height="18" rx="3" fill="#8cbca6"/><path d="m14 20 4 4 8-9" fill="none" stroke="#f8ffe6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
 burst:'<path d="M5 7h25v24M9 3h25v24" stroke="#779e91"/><rect x="2" y="11" width="29" height="26" rx="4" fill="#d8b96e" stroke="#8c764b"/><circle cx="16" cy="24" r="8" fill="#eaf2df" stroke="#658b80"/><circle cx="16" cy="24" r="4" fill="#3f7275"/><path d="m30 30 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z" fill="#fff0b8" stroke="#b39755"/>',

 eraser:'<path d="m6 24 16-18a4 4 0 0 1 6 0l8 8a4 4 0 0 1 0 6L21 35H14Z" fill="#b7c4dd" stroke="#788ca7"/><path d="m6 24 8-9 14 13-7 7H14Z" fill="#f3d6b2" stroke="#b69b7c"/><path d="M20 36h17M5 10l2-4M12 6V2M2 17h4" stroke="#bfaa78"/>',
 dream:'<path d="M29 5A15 15 0 1 0 35 28 14 14 0 0 1 29 5Z" fill="#b4bedc" stroke="#6e829d"/><path d="m11 6 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="#e6c889" stroke="#c2a871"/>',
 thread:'<ellipse cx="16" cy="11" rx="10" ry="5" fill="#e6cf9a" stroke="#af9768"/><path d="M6 11v17c0 7 20 7 20 0V11" fill="#d8dece" stroke="#839d99"/><path d="M7 15c5 4 13 4 18 0M7 20c5 4 13 4 18 0M7 25c5 4 13 4 18 0M25 28c4 10 15 5 10-1-4-6-7-1-4 1" stroke="#a4b5b3"/><ellipse cx="16" cy="10" rx="3" ry="1.5" fill="#ae9669" stroke="#ae9669"/>',
 satchel:'<path d="M12 12V9a8 8 0 0 1 16 0v3" stroke="#806747"/><rect x="4" y="12" width="32" height="24" rx="5" fill="#b3834f" stroke="#775c40"/><path d="M5 13h30v10c-8 4-22 4-30 0Z" fill="#d2ac6c" stroke="#8d704a"/><rect x="17" y="22" width="6" height="7" rx="1" fill="#efd18d" stroke="#92774c"/><path d="M10 32h20" stroke="#e5c38b"/>',
 editor:'<path d="M8 5h18v26H8Z" fill="#fff1cc" stroke="#8c815a"/><path d="M12 11h10M12 16h7M12 21h6" stroke="#6f9280"/><circle cx="26" cy="25" r="7" fill="#d7eee0" stroke="#4f8c7d"/><path d="m31 30 6 6M23 25l2 2 4-4" stroke="#4f8c7d"/>',

 bookmark:'<path d="M10 4h20v32L20 29 10 36Z" fill="#a8c9bc" stroke="#547d75"/><path d="m20 10 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#f4d890" stroke="#be9655"/>',
 stabilize:'<path d="M8 16a13 13 0 0 1 22-6l3 4M32 24a13 13 0 0 1-22 6l-3-4" stroke="#7cafac" stroke-width="3"/><path d="M33 6v8h-8M7 34v-8h8" stroke="#c1974f"/><circle cx="20" cy="17" r="5" fill="#eaf7ef" stroke="#527c80"/><path d="M16 24h8v7h-8Z" fill="#83b4b1" stroke="#527c80"/>',
 magnet:'<path d="M8 6v17a12 12 0 0 0 24 0V6h-8v17a4 4 0 0 1-8 0V6Z" fill="#81b5ad" stroke="#806641"/><path d="M8 12h8M24 12h8" stroke="#fff1c9" stroke-width="4"/>',
 repair:'<path d="m12 7 2 7 7 1 5-5 1-7c8 5 5 16-4 17L9 36l-6-5 13-16c-7 1-10-5-8-11Z" fill="#a3c0b5" stroke="#426866"/>',
 help:'<path d="M20 10C14 6 7 6 3 8v25c5-2 11-2 17 2 6-4 12-4 17-2V8c-4-2-11-2-17 2Zm0 0v25"/><path d="M8 14h6M8 20h6M26 14h6M26 20h6"/>',
 pulse:'<ellipse cx="20" cy="25" rx="13" ry="8" fill="#609eaa"/><ellipse cx="20" cy="21" rx="13" ry="7" fill="#a9dbd7"/><circle cx="20" cy="19" r="4" fill="#fff0ae"/><path d="M20 4v7M5 15l5 3M35 15l-5 3M20 31v6"/>',
 shield:'<path d="M20 3 35 9v12c0 9-15 16-15 16S5 30 5 21V9Z" fill="#7ab3ae" stroke="#c1974f"/><path d="m20 10 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#ffe7a8" stroke="#ffe7a8"/>',
 pause:'<path d="M14 10v20M26 10v20" stroke-width="5"/>',
 light:'<path d="m8 28 12-12 8 8-12 12ZM21 10l4-6M29 14l7-4M31 21h8"/>',
 slingshot:'<path d="M9 5 12 18 20 24 28 18 31 5M20 24v13" stroke="#855124" stroke-width="5"/><path d="m9 5 11 10L31 5" stroke="#485a60" stroke-width="2"/>',
 time:'<path d="M10 4h20M10 36h20M13 5v7l14 16v7M27 5v7L13 28v7M13 12h14M13 30h14"/>',
 run:'<circle cx="25" cy="7" r="4"/><path d="m13 16 8-5 6 9 7 1M21 12l-5 13 9 5-2 8M16 25l-5 10H4M11 10H3M9 18H1"/>',
 hammer:'<path d="m17 18-9 17 5 3 10-18" fill="#bc844b"/><path d="m12 10 7-7 16 11-7 8Z" fill="#a3b6ba"/>',
 jump:'<path d="M8 35h24M20 28V5M11 14l9-9 9 9"/><path d="M7 27v-6M33 27v-6"/>',
 special:'<path d="M14 27C3 15 13 4 20 5c10 0 16 12 6 22v5H14ZM15 36h10M20 1v2M4 8l4 3M36 8l-4 3"/>',
 double:'<path d="m3 13 10 14M13 13 3 27M20 12c2-7 16-5 14 3-1 4-14 9-14 15h15"/>',
 move:'<path d="M20 3v34M3 20h34M14 9l6-6 6 6M14 31l6 6 6-6M9 14l-6 6 6 6M31 14l6 6-6 6"/>',
 clock:'<circle cx="20" cy="20" r="16"/><path d="M20 9v12l8 5"/>'
};
export function icon(name){return `<svg class="game-icon" data-icon="${name}" viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${shapes[name]||shapes.move}</svg>`;}
export function applyIcons(root){root.querySelectorAll('[data-game-icon]').forEach(el=>el.innerHTML=icon(el.dataset.gameIcon));}
