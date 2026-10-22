export interface PlatformBadgeConfig {
  name: string;
  shortName: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  bannerGradient: string;
  iconSymbol: string;
}

export const getPlatformConfig = (platform: string): PlatformBadgeConfig => {
  const p = (platform || '').trim();

  // --- PLAYSTATION FAMILY ---
  if (p === 'PlayStation 5' || p.includes('PS5')) {
    return {
      name: 'PlayStation 5',
      shortName: 'PS5',
      badgeBg: 'bg-blue-600',
      textColor: 'text-white font-black',
      borderColor: 'border-blue-400/50 shadow-blue-500/20',
      bannerGradient: 'from-blue-600 via-indigo-600 to-blue-800',
      iconSymbol: '⚡',
    };
  }

  if (p === 'PlayStation 4' || p.includes('PS4')) {
    return {
      name: 'PlayStation 4',
      shortName: 'PS4',
      badgeBg: 'bg-blue-800',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-blue-500/50 shadow-blue-700/20',
      bannerGradient: 'from-blue-800 to-indigo-950',
      iconSymbol: '🔷',
    };
  }

  if (p === 'PlayStation 3' || p.includes('PS3')) {
    return {
      name: 'PlayStation 3',
      shortName: 'PS3',
      badgeBg: 'bg-gradient-to-r from-zinc-900 to-slate-800 text-amber-300',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-zinc-500/50 shadow-zinc-600/20',
      bannerGradient: 'from-zinc-900 via-slate-900 to-blue-950',
      iconSymbol: '💿',
    };
  }

  if (p === 'PlayStation 2' || p === 'PS2') {
    return {
      name: 'PlayStation 2',
      shortName: 'PS2',
      badgeBg: 'bg-blue-950 border border-cyan-400/50',
      textColor: 'text-cyan-300 font-extrabold',
      borderColor: 'border-cyan-500/40 shadow-cyan-500/20',
      bannerGradient: 'from-blue-950 via-slate-900 to-cyan-950',
      iconSymbol: '🌀',
    };
  }

  if (p === 'PlayStation 1' || p.includes('PS1') || p.includes('PSX')) {
    return {
      name: 'PlayStation 1 (PSX)',
      shortName: 'PS1',
      badgeBg: 'bg-slate-300 dark:bg-slate-700 text-zinc-900 dark:text-white',
      textColor: 'text-zinc-900 dark:text-white font-extrabold',
      borderColor: 'border-slate-400/60 shadow-slate-500/20',
      bannerGradient: 'from-slate-400 via-slate-600 to-slate-800',
      iconSymbol: '🎮',
    };
  }

  if (p.includes('PSP') || p.includes('Portable')) {
    return {
      name: 'PlayStation Portable (PSP)',
      shortName: 'PSP',
      badgeBg: 'bg-zinc-800 border border-zinc-500/60',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-zinc-400/40 shadow-zinc-500/20',
      bannerGradient: 'from-zinc-800 to-zinc-950',
      iconSymbol: '🕹️',
    };
  }

  if (p.includes('Vita')) {
    return {
      name: 'PlayStation Vita',
      shortName: 'PS VITA',
      badgeBg: 'bg-sky-600',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-sky-400/50 shadow-sky-500/20',
      bannerGradient: 'from-sky-600 to-blue-800',
      iconSymbol: '✨',
    };
  }

  if (p.includes('VR')) {
    return {
      name: 'PlayStation VR / VR2',
      shortName: 'PS VR',
      badgeBg: 'bg-indigo-900 border border-cyan-400',
      textColor: 'text-cyan-300 font-extrabold',
      borderColor: 'border-cyan-400/50 shadow-cyan-500/20',
      bannerGradient: 'from-indigo-950 via-blue-900 to-cyan-950',
      iconSymbol: '🥽',
    };
  }

  // --- NINTENDO FAMILY ---
  if (p === 'Nintendo Switch 2' || p.includes('Switch 2')) {
    return {
      name: 'Nintendo Switch 2',
      shortName: 'SWITCH 2',
      badgeBg: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700',
      textColor: 'text-white font-black',
      borderColor: 'border-red-300/40 shadow-red-500/30',
      bannerGradient: 'from-red-600 via-rose-600 to-red-800',
      iconSymbol: '🔴',
    };
  }

  if (p === 'Nintendo Switch' || (p.includes('Switch') && !p.includes('Switch 2'))) {
    return {
      name: 'Nintendo Switch',
      shortName: 'SWITCH',
      badgeBg: 'bg-red-600',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-red-400/50 shadow-red-500/20',
      bannerGradient: 'from-red-600 to-red-700',
      iconSymbol: '🔴',
    };
  }

  if (p.includes('Wii U')) {
    return {
      name: 'Nintendo Wii U',
      shortName: 'WII U',
      badgeBg: 'bg-cyan-600',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-cyan-400/50 shadow-cyan-500/20',
      bannerGradient: 'from-cyan-600 to-sky-800',
      iconSymbol: '📱',
    };
  }

  if (p === 'Nintendo Wii' || (p.includes('Wii') && !p.includes('Wii U'))) {
    return {
      name: 'Nintendo Wii',
      shortName: 'WII',
      badgeBg: 'bg-sky-500',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-sky-300/50 shadow-sky-400/20',
      bannerGradient: 'from-sky-500 to-blue-600',
      iconSymbol: '🎯',
    };
  }

  if (p.includes('GameCube')) {
    return {
      name: 'Nintendo GameCube',
      shortName: 'GAMECUBE',
      badgeBg: 'bg-purple-800',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-purple-400/50 shadow-purple-500/20',
      bannerGradient: 'from-purple-800 to-indigo-900',
      iconSymbol: '🟣',
    };
  }

  if (p.includes('N64') || p.includes('Nintendo 64')) {
    return {
      name: 'Nintendo 64 (N64)',
      shortName: 'N64',
      badgeBg: 'bg-gradient-to-r from-amber-600 to-purple-800',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-amber-400/50 shadow-amber-500/20',
      bannerGradient: 'from-amber-600 to-purple-900',
      iconSymbol: '⭐',
    };
  }

  if (p.includes('SNES') || p.includes('Super Nintendo')) {
    return {
      name: 'Super Nintendo (SNES)',
      shortName: 'SNES',
      badgeBg: 'bg-indigo-700',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-indigo-400/50 shadow-indigo-500/20',
      bannerGradient: 'from-indigo-700 to-purple-900',
      iconSymbol: '👾',
    };
  }

  if (p.includes('NES') && !p.includes('SNES')) {
    return {
      name: 'Nintendo (NES)',
      shortName: 'NES 8-BIT',
      badgeBg: 'bg-rose-700',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-rose-400/50 shadow-rose-500/20',
      bannerGradient: 'from-rose-700 to-zinc-900',
      iconSymbol: '🕹️',
    };
  }

  if (p.includes('Virtual Boy')) {
    return {
      name: 'Virtual Boy',
      shortName: 'VIRTUAL BOY',
      badgeBg: 'bg-black border border-red-600 text-red-500',
      textColor: 'text-red-400 font-black',
      borderColor: 'border-red-600/60 shadow-red-600/30',
      bannerGradient: 'from-black via-red-950 to-black',
      iconSymbol: '🔴',
    };
  }

  if (p.includes('3DS') || p.includes('2DS')) {
    return {
      name: 'Nintendo 3DS / 2DS',
      shortName: '3DS',
      badgeBg: 'bg-rose-600',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-rose-400/50 shadow-rose-500/20',
      bannerGradient: 'from-rose-600 to-red-800',
      iconSymbol: '🔴',
    };
  }

  if (p.includes('Nintendo DS') || p === 'Nintendo DS' || p === 'NDS') {
    return {
      name: 'Nintendo DS',
      shortName: 'NDS',
      badgeBg: 'bg-slate-600',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-slate-400/50 shadow-slate-500/20',
      bannerGradient: 'from-slate-600 to-zinc-800',
      iconSymbol: '🎮',
    };
  }

  if (p.includes('GBA') || p.includes('Advance')) {
    return {
      name: 'Game Boy Advance (GBA)',
      shortName: 'GBA',
      badgeBg: 'bg-indigo-600',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-indigo-400/50 shadow-indigo-500/20',
      bannerGradient: 'from-indigo-600 to-purple-800',
      iconSymbol: '👾',
    };
  }

  if (p.includes('Micro')) {
    return {
      name: 'Game Boy Micro',
      shortName: 'GB MICRO',
      badgeBg: 'bg-zinc-700 border border-slate-300',
      textColor: 'text-sky-300 font-extrabold',
      borderColor: 'border-slate-400/50 shadow-slate-500/20',
      bannerGradient: 'from-zinc-700 via-slate-600 to-zinc-900',
      iconSymbol: '✨',
    };
  }

  if (p.includes('Game Boy Color') || p.includes('GBC')) {
    return {
      name: 'Game Boy Color',
      shortName: 'GBC',
      badgeBg: 'bg-purple-600',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-purple-400/50 shadow-purple-500/20',
      bannerGradient: 'from-purple-600 via-pink-600 to-indigo-800',
      iconSymbol: '🌈',
    };
  }

  if (p.includes('Clásica') || p === 'Game Boy' || p.includes('Game Boy / Color')) {
    return {
      name: 'Game Boy (Clásica)',
      shortName: 'GAME BOY',
      badgeBg: 'bg-lime-800 text-lime-200 border border-lime-600',
      textColor: 'text-lime-200 font-extrabold',
      borderColor: 'border-lime-500/50 shadow-lime-500/20',
      bannerGradient: 'from-stone-700 via-lime-950 to-stone-900',
      iconSymbol: '🟢',
    };
  }

  if (p.includes('Game & Watch')) {
    return {
      name: 'Game & Watch',
      shortName: 'GAME & WATCH',
      badgeBg: 'bg-amber-700 text-amber-100 border border-amber-500',
      textColor: 'text-amber-100 font-black',
      borderColor: 'border-amber-400/50 shadow-amber-500/20',
      bannerGradient: 'from-amber-800 via-amber-700 to-amber-950',
      iconSymbol: '⏱️',
    };
  }

  // --- XBOX FAMILY ---
  if (p.includes('Xbox Series')) {
    return {
      name: 'Xbox Series X|S',
      shortName: 'XBOX SERIES',
      badgeBg: 'bg-emerald-600',
      textColor: 'text-white font-black',
      borderColor: 'border-emerald-400/50 shadow-emerald-500/20',
      bannerGradient: 'from-emerald-600 to-green-800',
      iconSymbol: '🟢',
    };
  }

  if (p === 'Xbox One' || (p.includes('Xbox One'))) {
    return {
      name: 'Xbox One',
      shortName: 'XBOX ONE',
      badgeBg: 'bg-green-700',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-green-500/50 shadow-green-600/20',
      bannerGradient: 'from-green-700 to-emerald-900',
      iconSymbol: '🟩',
    };
  }

  if (p.includes('Xbox 360')) {
    return {
      name: 'Xbox 360',
      shortName: 'XBOX 360',
      badgeBg: 'bg-lime-600 text-zinc-950 font-black',
      textColor: 'text-white font-black',
      borderColor: 'border-lime-400/50 shadow-lime-500/20',
      bannerGradient: 'from-lime-600 via-green-700 to-zinc-900',
      iconSymbol: '🟢',
    };
  }

  if (p.includes('Xbox Original') || (p.includes('Xbox') && !p.includes('Series') && !p.includes('One') && !p.includes('360'))) {
    return {
      name: 'Xbox Original',
      shortName: 'XBOX CLÁSICA',
      badgeBg: 'bg-zinc-900 border border-green-500',
      textColor: 'text-green-400 font-extrabold',
      borderColor: 'border-green-500/50 shadow-green-600/20',
      bannerGradient: 'from-zinc-950 via-green-950 to-black',
      iconSymbol: '✳️',
    };
  }

  // --- SEGA FAMILY ---
  if (p.includes('Dreamcast')) {
    return {
      name: 'SEGA Dreamcast',
      shortName: 'DREAMCAST',
      badgeBg: 'bg-orange-600',
      textColor: 'text-white font-black',
      borderColor: 'border-orange-400/50 shadow-orange-500/20',
      bannerGradient: 'from-orange-600 to-red-700',
      iconSymbol: '🌀',
    };
  }

  if (p.includes('Saturn')) {
    return {
      name: 'SEGA Saturn',
      shortName: 'SATURN',
      badgeBg: 'bg-zinc-800 border border-amber-400/60',
      textColor: 'text-amber-300 font-extrabold',
      borderColor: 'border-amber-400/50 shadow-amber-500/20',
      bannerGradient: 'from-zinc-900 via-amber-950 to-zinc-900',
      iconSymbol: '🪐',
    };
  }

  if (p.includes('Mega Drive') || p.includes('Genesis')) {
    return {
      name: 'SEGA Mega Drive',
      shortName: 'MEGA DRIVE',
      badgeBg: 'bg-neutral-900 border border-blue-500/70',
      textColor: 'text-blue-300 font-extrabold',
      borderColor: 'border-blue-500/50 shadow-blue-600/20',
      bannerGradient: 'from-neutral-900 via-blue-950 to-black',
      iconSymbol: '⚡',
    };
  }

  if (p.includes('Mega-CD') || p.includes('32X') || p.includes('Sega CD')) {
    return {
      name: 'SEGA Mega-CD / 32X',
      shortName: 'MEGA-CD 32X',
      badgeBg: 'bg-purple-950 border border-fuchsia-500/70',
      textColor: 'text-fuchsia-300 font-extrabold',
      borderColor: 'border-fuchsia-500/50 shadow-fuchsia-600/20',
      bannerGradient: 'from-purple-950 via-zinc-900 to-fuchsia-950',
      iconSymbol: '💿',
    };
  }

  if (p.includes('Game Gear')) {
    return {
      name: 'SEGA Game Gear',
      shortName: 'GAME GEAR',
      badgeBg: 'bg-zinc-900 border border-sky-400',
      textColor: 'text-sky-300 font-extrabold',
      borderColor: 'border-sky-400/50 shadow-sky-500/20',
      bannerGradient: 'from-zinc-900 via-blue-950 to-zinc-950',
      iconSymbol: '🔋',
    };
  }

  if (p.includes('Master System')) {
    return {
      name: 'SEGA Master System',
      shortName: 'MASTER SYSTEM',
      badgeBg: 'bg-blue-700',
      textColor: 'text-white font-extrabold',
      borderColor: 'border-blue-400/50 shadow-blue-500/20',
      bannerGradient: 'from-blue-700 to-indigo-900',
      iconSymbol: '🎮',
    };
  }

  // --- RETRO LEGENDS & CULT SYSTEMS ---
  if (p.includes('Neo Geo CD')) {
    return {
      name: 'Neo Geo CD',
      shortName: 'NEO GEO CD',
      badgeBg: 'bg-gradient-to-r from-yellow-700 to-zinc-900 border border-yellow-400',
      textColor: 'text-yellow-200 font-extrabold',
      borderColor: 'border-yellow-400/50 shadow-yellow-500/20',
      bannerGradient: 'from-yellow-800 via-zinc-900 to-black',
      iconSymbol: '💿',
    };
  }

  if (p.includes('Neo Geo Pocket')) {
    return {
      name: 'Neo Geo Pocket / Color',
      shortName: 'NG POCKET',
      badgeBg: 'bg-slate-800 border border-amber-400',
      textColor: 'text-amber-300 font-extrabold',
      borderColor: 'border-amber-400/50 shadow-amber-500/20',
      bannerGradient: 'from-slate-800 via-amber-950 to-slate-900',
      iconSymbol: '🕹️',
    };
  }

  if (p.includes('Neo Geo')) {
    return {
      name: 'Neo Geo AES / MVS',
      shortName: 'NEO GEO AES',
      badgeBg: 'bg-gradient-to-r from-yellow-600 to-amber-700',
      textColor: 'text-white font-black',
      borderColor: 'border-yellow-400/50 shadow-yellow-500/20',
      bannerGradient: 'from-yellow-600 to-amber-900',
      iconSymbol: '👑',
    };
  }

  if (p.includes('PC Engine') || p.includes('TurboGrafx')) {
    return {
      name: 'PC Engine / TurboGrafx-16',
      shortName: 'PC ENGINE',
      badgeBg: 'bg-gradient-to-r from-orange-600 to-amber-600',
      textColor: 'text-white font-black',
      borderColor: 'border-orange-400/50 shadow-orange-500/20',
      bannerGradient: 'from-orange-600 via-amber-600 to-zinc-900',
      iconSymbol: '🔥',
    };
  }

  if (p.includes('Atari 2600') || p.includes('7800') || p.includes('Atari')) {
    return {
      name: 'Atari 2600 / 7800',
      shortName: 'ATARI',
      badgeBg: 'bg-amber-900 border border-orange-500',
      textColor: 'text-orange-200 font-black',
      borderColor: 'border-orange-500/50 shadow-orange-600/20',
      bannerGradient: 'from-amber-950 via-stone-900 to-amber-900',
      iconSymbol: '👾',
    };
  }

  if (p.includes('Jaguar') || p.includes('Lynx')) {
    return {
      name: 'Atari Jaguar / Lynx',
      shortName: 'ATARI JAGUAR',
      badgeBg: 'bg-zinc-950 border border-red-600',
      textColor: 'text-red-400 font-black',
      borderColor: 'border-red-600/50 shadow-red-700/20',
      bannerGradient: 'from-black via-red-950 to-zinc-950',
      iconSymbol: '🐆',
    };
  }

  if (p.includes('3DO')) {
    return {
      name: '3DO Interactive Multiplayer',
      shortName: '3DO',
      badgeBg: 'bg-indigo-950 border border-yellow-500',
      textColor: 'text-yellow-300 font-extrabold',
      borderColor: 'border-yellow-400/50 shadow-yellow-500/20',
      bannerGradient: 'from-indigo-950 via-zinc-900 to-blue-950',
      iconSymbol: '⭐',
    };
  }

  if (p.includes('WonderSwan')) {
    return {
      name: 'WonderSwan / Color',
      shortName: 'WONDERSWAN',
      badgeBg: 'bg-teal-700 border border-teal-300',
      textColor: 'text-teal-100 font-extrabold',
      borderColor: 'border-teal-400/50 shadow-teal-500/20',
      bannerGradient: 'from-teal-700 via-cyan-800 to-teal-950',
      iconSymbol: '🦢',
    };
  }

  if (p.includes('Amiga') || p.includes('Commodore')) {
    return {
      name: 'Amiga CD32 / Commodore',
      shortName: 'AMIGA / C64',
      badgeBg: 'bg-gradient-to-r from-red-600 via-amber-500 to-blue-600',
      textColor: 'text-white font-black',
      borderColor: 'border-amber-400/50 shadow-amber-500/20',
      bannerGradient: 'from-red-900 via-stone-900 to-blue-950',
      iconSymbol: '💾',
    };
  }

  if (p.includes('MSX') || p.includes('Spectrum') || p.includes('Amstrad')) {
    return {
      name: 'MSX / Spectrum / Retro PC',
      shortName: 'MSX / SPECTRUM',
      badgeBg: 'bg-emerald-950 border border-emerald-400',
      textColor: 'text-emerald-300 font-mono font-extrabold',
      borderColor: 'border-emerald-400/50 shadow-emerald-500/20',
      bannerGradient: 'from-emerald-950 via-black to-zinc-950',
      iconSymbol: '📼',
    };
  }

  if (p.includes('CD-i') || p.includes('Philips')) {
    return {
      name: 'Philips CD-i',
      shortName: 'PHILIPS CD-I',
      badgeBg: 'bg-blue-950 border border-amber-400',
      textColor: 'text-amber-200 font-extrabold',
      borderColor: 'border-amber-400/50 shadow-amber-500/20',
      bannerGradient: 'from-blue-950 via-slate-900 to-amber-950',
      iconSymbol: '💿',
    };
  }

  if (p.includes('Pokémon Mini') || p.includes('Pokemon Mini')) {
    return {
      name: 'Pokémon Mini',
      shortName: 'POKÉMON MINI',
      badgeBg: 'bg-indigo-600 border border-yellow-400',
      textColor: 'text-yellow-300 font-black',
      borderColor: 'border-yellow-400/50 shadow-yellow-500/20',
      bannerGradient: 'from-indigo-600 via-purple-600 to-indigo-800',
      iconSymbol: '⚡',
    };
  }

  // --- HANDHELDS & PC ---
  if (p.includes('Steam Deck') || p.includes('ROG Ally') || p.includes('PC Portátil')) {
    return {
      name: 'Steam Deck / PC Portátil',
      shortName: 'STEAM DECK',
      badgeBg: 'bg-gradient-to-r from-indigo-700 to-blue-600',
      textColor: 'text-cyan-200 font-black',
      borderColor: 'border-cyan-400/50 shadow-cyan-500/20',
      bannerGradient: 'from-indigo-900 via-blue-900 to-zinc-950',
      iconSymbol: '🚀',
    };
  }

  if (p.includes('PC')) {
    return {
      name: 'PC Físico',
      shortName: 'PC EDICIÓN FÍSICA',
      badgeBg: 'bg-zinc-800',
      textColor: 'text-amber-300 font-extrabold',
      borderColor: 'border-amber-400/40 shadow-amber-500/20',
      bannerGradient: 'from-zinc-800 to-zinc-900',
      iconSymbol: '💻',
    };
  }

  return {
    name: platform,
    shortName: platform.toUpperCase(),
    badgeBg: 'bg-zinc-800',
    textColor: 'text-white font-extrabold',
    borderColor: 'border-zinc-500/50',
    bannerGradient: 'from-zinc-700 to-zinc-800',
    iconSymbol: '🎮',
  };
};
