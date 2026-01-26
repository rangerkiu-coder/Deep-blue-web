import React from 'react';
import { StickerType } from '../types';

// Extended types for internal frame assets + stickers
export type AssetType = StickerType | 'jellyfish' | 'school';

export const SVG_STRINGS: Record<string, string> = {
  betta: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bettaGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style="stop-color:rgb(244,63,94);stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:rgb(136,19,55);stop-opacity:0" />
        </radialGradient>
        <linearGradient id="bettaBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#be123c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fb7185;stop-opacity:1" />
        </linearGradient>
      </defs>
      <g filter="drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))">
        <path d="M140,80 Q160,50 120,40 Q90,30 60,60 Q30,40 10,70 Q20,110 50,130 Q90,160 130,130 Q180,140 190,100 Z" fill="url(#bettaBody)" />
        <path d="M130,85 Q170,60 180,90 T140,110" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
        <circle cx="150" cy="70" r="15" fill="url(#bettaGlow)" opacity="0.3" />
        <path d="M60,60 Q40,20 80,30" fill="#9f1239" opacity="0.8" />
        <path d="M50,130 Q40,170 80,150" fill="#9f1239" opacity="0.8" />
        <circle cx="50" cy="85" r="4" fill="white" />
        <circle cx="51" cy="85" r="1.5" fill="black" />
      </g>
    </svg>
  `,
  starfish: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
        </radialGradient>
      </defs>
      <g filter="drop-shadow(2px 2px 2px rgb(0 0 0 / 0.3))">
        <path d="M50,5 L63,35 L95,38 L70,58 L78,90 L50,72 L22,90 L30,58 L5,38 L37,35 Z" fill="url(#starGrad)" stroke="#b45309" stroke-width="1" stroke-linejoin="round" />
        <circle cx="50" cy="50" r="2" fill="#fff" opacity="0.6"/>
        <circle cx="50" cy="20" r="1" fill="#fff" opacity="0.5"/>
        <circle cx="75" cy="40" r="1" fill="#fff" opacity="0.5"/>
      </g>
    </svg>
  `,
  shell: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="shellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
           <stop offset="0%" style="stop-color:#fde68a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
         </linearGradient>
       </defs>
       <g filter="drop-shadow(2px 2px 1px rgb(0 0 0 / 0.3))">
         <path d="M20,80 Q50,10 80,80 L50,90 Z" fill="url(#shellGrad)" />
         <path d="M20,80 Q35,45 50,90" fill="none" stroke="#92400e" stroke-width="1" />
         <path d="M80,80 Q65,45 50,90" fill="none" stroke="#92400e" stroke-width="1" />
         <path d="M50,90 L50,25" fill="none" stroke="#92400e" stroke-width="1" opacity="0.5" />
       </g>
    </svg>
  `,
  bubble: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
       <radialGradient id="bubbleGrad" cx="30%" cy="30%" r="70%">
         <stop offset="0%" style="stop-color:white;stop-opacity:0.8" />
         <stop offset="80%" style="stop-color:#bae6fd;stop-opacity:0.2" />
         <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:0.1" />
       </radialGradient>
       <circle cx="50" cy="50" r="40" fill="url(#bubbleGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
       <path d="M60,25 Q75,30 75,45" fill="none" stroke="white" stroke-width="2" opacity="0.6" stroke-linecap="round" />
    </svg>
  `,
  seaweed: `
    <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="weedGrad" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" style="stop-color:#84cc16;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#14532d;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M50,200 Q20,150 50,120 Q80,90 40,60 Q10,30 50,0 Q80,40 60,80 Q40,120 70,160 Q90,190 50,200 Z" fill="url(#weedGrad)" opacity="0.9" />
    </svg>
  `,
  coral: `
     <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coralGrad" x1="0" y1="1" x2="1" y2="0">
           <stop offset="0%" style="stop-color:#fda4af;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#e11d48;stop-opacity:1" />
        </linearGradient>
      </defs>
      <g filter="drop-shadow(2px 2px 2px rgb(0 0 0 / 0.4))">
         <path d="M100,200 C100,200 20,150 50,80 C60,50 30,30 20,50 M100,200 C100,200 180,150 150,80 C140,50 170,30 180,50 M100,200 L100,100 C100,100 80,60 90,30 M100,100 C100,100 120,60 110,30" 
         stroke="url(#coralGrad)" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round" />
         <circle cx="50" cy="80" r="5" fill="#ffe4e6" opacity="0.6"/>
         <circle cx="150" cy="80" r="5" fill="#ffe4e6" opacity="0.6"/>
      </g>
    </svg>
  `,
  crab: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.2))">
        <!-- Legs -->
        <path d="M20,60 Q10,50 15,40" stroke="#f87171" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M80,60 Q90,50 85,40" stroke="#f87171" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M25,65 Q10,70 15,80" stroke="#f87171" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M75,65 Q90,70 85,80" stroke="#f87171" stroke-width="5" fill="none" stroke-linecap="round" />
        <!-- Body -->
        <ellipse cx="50" cy="60" rx="30" ry="20" fill="#ef4444" />
        <!-- Eyes -->
        <circle cx="35" cy="45" r="5" fill="white" stroke="#ef4444" stroke-width="2"/>
        <circle cx="35" cy="45" r="2" fill="black"/>
        <circle cx="65" cy="45" r="5" fill="white" stroke="#ef4444" stroke-width="2"/>
        <circle cx="65" cy="45" r="2" fill="black"/>
        <!-- Smile -->
        <path d="M45,65 Q50,68 55,65" fill="none" stroke="#7f1d1d" stroke-width="2" stroke-linecap="round"/>
        <!-- Claws -->
        <path d="M15,40 Q5,30 15,25 Q20,35 15,40" fill="#ef4444" />
        <path d="M85,40 Q95,30 85,25 Q80,35 85,40" fill="#ef4444" />
      </g>
    </svg>
  `,
  octopus: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.2))">
        <!-- Tentacles -->
        <path d="M30,70 Q20,90 35,90" stroke="#d8b4fe" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M45,70 Q45,95 55,90" stroke="#d8b4fe" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M60,70 Q70,90 80,80" stroke="#d8b4fe" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M70,65 Q90,70 90,50" stroke="#d8b4fe" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M20,65 Q10,70 10,50" stroke="#d8b4fe" stroke-width="6" fill="none" stroke-linecap="round"/>
        <!-- Head -->
        <path d="M20,50 Q20,10 50,10 Q80,10 80,50 L80,60 Q80,70 50,70 Q20,70 20,60 Z" fill="#c084fc" />
        <!-- Eyes -->
        <circle cx="35" cy="45" r="4" fill="white" />
        <circle cx="35" cy="45" r="2" fill="black" />
        <circle cx="65" cy="45" r="4" fill="white" />
        <circle cx="65" cy="45" r="2" fill="black" />
        <!-- Blush -->
        <circle cx="28" cy="55" r="3" fill="#f0abfc" opacity="0.6"/>
        <circle cx="72" cy="55" r="3" fill="#f0abfc" opacity="0.6"/>
      </g>
    </svg>
  `,
  bow: `
    <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(1px 2px 2px rgba(0,0,0,0.2))">
         <path d="M50,30 Q30,0 10,20 Q0,30 10,40 Q30,60 50,30 Z" fill="#f9a8d4" />
         <path d="M50,30 Q70,0 90,20 Q100,30 90,40 Q70,60 50,30 Z" fill="#f9a8d4" />
         <circle cx="50" cy="30" r="8" fill="#f472b6" />
         <path d="M20,25 Q25,25 25,30" fill="none" stroke="#fbcfe8" stroke-width="2" />
         <path d="M80,25 Q75,25 75,30" fill="none" stroke="#fbcfe8" stroke-width="2" />
      </g>
    </svg>
  `,
  sparkles: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sparkleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#fef08a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
        </radialGradient>
      </defs>
      <path d="M50,10 Q60,40 90,50 Q60,60 50,90 Q40,60 10,50 Q40,40 50,10 Z" fill="#fef08a" />
      <path d="M20,20 Q25,30 35,35 Q25,40 20,50 Q15,40 5,35 Q15,30 20,20 Z" fill="#fef9c3" opacity="0.8" />
      <path d="M80,80 Q82,85 85,87 Q82,89 80,94 Q78,89 75,87 Q78,85 80,80 Z" fill="#fef9c3" opacity="0.8" />
    </svg>
  `,
  heart: `
     <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
       <path d="M50,85 C50,85 10,55 10,30 C10,15 25,5 40,10 C45,12 50,20 50,20 C50,20 55,12 60,10 C75,5 90,15 90,30 C90,55 50,85 50,85 Z" fill="#fda4af" stroke="#f43f5e" stroke-width="2" stroke-linejoin="round"/>
       <path d="M25,20 Q30,15 35,20" fill="none" stroke="white" stroke-width="3" opacity="0.5" stroke-linecap="round"/>
     </svg>
  `,
  jellyfish_cute: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
        <!-- Tentacles -->
        <path d="M30,60 Q20,80 30,90" stroke="#f0abfc" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M50,60 Q50,85 50,90" stroke="#f0abfc" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M70,60 Q80,80 70,90" stroke="#f0abfc" stroke-width="4" fill="none" stroke-linecap="round"/>
        
        <!-- Head -->
        <path d="M15,60 Q15,10 50,10 Q85,10 85,60 Z" fill="#e879f9" />
        
        <!-- Face -->
        <circle cx="35" cy="45" r="3" fill="black" />
        <circle cx="65" cy="45" r="3" fill="black" />
        <path d="M45,52 Q50,55 55,52" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"/>
        <circle cx="28" cy="50" r="4" fill="#f5d0fe" opacity="0.6"/>
        <circle cx="72" cy="50" r="4" fill="#f5d0fe" opacity="0.6"/>
      </g>
    </svg>
  `,
  star_cute: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
         <!-- Rounded Star -->
         <path d="M50,5 Q60,35 90,35 Q65,55 75,85 Q50,70 25,85 Q35,55 10,35 Q40,35 50,5 Z" 
               fill="#fef08a" stroke="#fde047" stroke-width="2" stroke-linejoin="round"/>
         <!-- Face -->
         <circle cx="40" cy="45" r="3" fill="black"/>
         <circle cx="60" cy="45" r="3" fill="black"/>
         <path d="M45,55 Q50,60 55,55" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"/>
      </g>
    </svg>
  `,
  clam_cute: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
        <!-- Shell Bottom -->
        <path d="M20,60 Q50,95 80,60" fill="#bae6fd" stroke="#7dd3fc" stroke-width="2"/>
        <!-- Shell Top -->
        <path d="M20,60 Q10,20 50,20 Q90,20 80,60" fill="#bae6fd" stroke="#7dd3fc" stroke-width="2"/>
        <!-- Pearl -->
        <circle cx="50" cy="60" r="12" fill="#fdf2f8" stroke="#fce7f3" stroke-width="1"/>
        <!-- Face on Shell -->
        <circle cx="38" cy="45" r="3" fill="black"/>
        <circle cx="62" cy="45" r="3" fill="black"/>
        <path d="M45,50 Q50,53 55,50" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"/>
      </g>
    </svg>
  `,
  seahorse: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
         <!-- Body -->
         <path d="M40,20 Q30,10 50,10 Q65,10 65,25 Q65,40 55,45 Q45,50 45,60 Q45,75 55,80 Q65,85 60,95 Q50,100 40,90 Q30,80 35,60 Q40,50 50,45" 
           fill="#fdba74" stroke="#fb923c" stroke-width="2" stroke-linecap="round"/>
         <!-- Snout -->
         <path d="M40,20 L30,22" stroke="#fb923c" stroke-width="3" fill="none" stroke-linecap="round"/>
         <!-- Eye -->
         <circle cx="50" cy="20" r="3" fill="black"/>
         <!-- Fin -->
         <path d="M65,35 Q75,35 70,45" fill="#fed7aa" stroke="#fb923c" stroke-width="1"/>
      </g>
    </svg>
  `,
  narwhal: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
         <!-- Horn -->
         <path d="M30,40 L10,25" stroke="#fcd34d" stroke-width="3" stroke-linecap="round"/>
         <!-- Body -->
         <path d="M30,40 Q25,70 50,70 Q80,70 90,50 Q80,30 50,30 Q35,30 30,40 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
         <!-- Tail -->
         <path d="M90,50 Q95,40 100,50 Q95,60 90,50" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
         <!-- Eye -->
         <circle cx="45" cy="45" r="3" fill="black"/>
         <circle cx="40" cy="50" r="3" fill="#fecaca" opacity="0.6"/>
      </g>
    </svg>
  `,
  shark: `
    <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sharkGrad" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#334155;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M280,75 Q250,70 220,60 Q180,40 140,45 Q150,20 130,10 Q120,40 100,50 Q60,55 20,70 Q40,80 20,90 Q60,100 100,95 Q130,120 160,100 Q190,100 220,90 Q250,85 280,75 Z" 
        fill="url(#sharkGrad)" opacity="0.7" />
      <path d="M140,45 Q130,70 160,75" fill="none" stroke="#475569" stroke-width="2" opacity="0.5"/>
    </svg>
  `,
  jellyfish: `
    <svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="jellyHead" cx="50%" cy="40%" r="50%">
          <stop offset="0%" style="stop-color:#e879f9;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#a21caf;stop-opacity:0.1" />
        </radialGradient>
      </defs>
      <g opacity="0.8">
        <path d="M10,50 Q50,-20 90,50 Z" fill="url(#jellyHead)" filter="drop-shadow(0 0 5px #e879f9)"/>
        <path d="M20,50 Q10,100 25,140" stroke="#f5d0fe" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M40,50 Q30,110 45,150" stroke="#f5d0fe" stroke-width="2" fill="none" opacity="0.8"/>
        <path d="M60,50 Q70,110 55,150" stroke="#f5d0fe" stroke-width="2" fill="none" opacity="0.8"/>
        <path d="M80,50 Q90,100 75,140" stroke="#f5d0fe" stroke-width="2" fill="none" opacity="0.6"/>
      </g>
    </svg>
  `,
  school: `
    <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
       <g fill="#fde047" opacity="0.6">
         <path d="M10,20 Q20,15 30,20 Q20,25 10,20 Z" />
         <path d="M40,30 Q50,25 60,30 Q50,35 40,30 Z" />
         <path d="M25,50 Q35,45 45,50 Q35,55 25,50 Z" />
         <path d="M60,10 Q70,5 80,10 Q70,15 60,10 Z" />
       </g>
    </svg>
  `,
  fish: `
    <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fishGrad" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.2))">
        <!-- Tail -->
        <path d="M10,40 Q20,20 30,30 Q20,40 30,50 Q20,60 10,40 Z" fill="url(#fishGrad)" />
        <!-- Body -->
        <ellipse cx="60" cy="40" rx="35" ry="25" fill="url(#fishGrad)" />
        <!-- Fins -->
        <path d="M40,55 Q35,70 50,65" fill="#7dd3fc" opacity="0.8"/>
        <path d="M40,25 Q35,10 50,15" fill="#7dd3fc" opacity="0.8"/>
        <!-- Eye -->
        <circle cx="75" cy="35" r="5" fill="white" />
        <circle cx="76" cy="35" r="2.5" fill="black" />
        <!-- Scale pattern -->
        <path d="M45,35 Q50,38 55,35" fill="none" stroke="#bae6fd" stroke-width="1" opacity="0.6"/>
        <path d="M50,42 Q55,45 60,42" fill="none" stroke="#bae6fd" stroke-width="1" opacity="0.6"/>
      </g>
    </svg>
  `,
  sailboat: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.2))">
        <!-- Hull -->
        <path d="M20,70 L50,85 L80,70 L70,65 L30,65 Z" fill="#78716c" stroke="#57534e" stroke-width="2"/>
        <!-- Sail Main -->
        <path d="M50,20 L50,65 L75,65 Z" fill="#fef9c3" stroke="#fde047" stroke-width="1.5"/>
        <!-- Sail Small -->
        <path d="M50,30 L50,65 L30,65 Z" fill="#fef08a" stroke="#fde047" stroke-width="1.5"/>
        <!-- Mast -->
        <line x1="50" y1="20" x2="50" y2="70" stroke="#57534e" stroke-width="2"/>
        <!-- Flag -->
        <path d="M50,20 L60,22 L50,24 Z" fill="#fb7185"/>
        <!-- Waves -->
        <path d="M10,75 Q20,72 30,75 Q40,78 50,75 Q60,72 70,75 Q80,78 90,75" fill="none" stroke="#bae6fd" stroke-width="1.5" opacity="0.6"/>
      </g>
    </svg>
  `,
  turtle: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
        <!-- Flippers -->
        <ellipse cx="20" cy="55" rx="8" ry="15" fill="#4ade80" opacity="0.8"/>
        <ellipse cx="80" cy="55" rx="8" ry="15" fill="#4ade80" opacity="0.8"/>
        <ellipse cx="30" cy="75" rx="8" ry="12" fill="#4ade80" opacity="0.8"/>
        <ellipse cx="70" cy="75" rx="8" ry="12" fill="#4ade80" opacity="0.8"/>
        <!-- Shell -->
        <ellipse cx="50" cy="60" rx="35" ry="25" fill="#22c55e" stroke="#16a34a" stroke-width="2"/>
        <!-- Shell Pattern -->
        <path d="M50,35 L50,85" stroke="#16a34a" stroke-width="1.5" opacity="0.6"/>
        <path d="M30,50 L70,50" stroke="#16a34a" stroke-width="1.5" opacity="0.6"/>
        <path d="M30,70 L70,70" stroke="#16a34a" stroke-width="1.5" opacity="0.6"/>
        <circle cx="40" cy="45" r="6" fill="#86efac" opacity="0.4"/>
        <circle cx="60" cy="45" r="6" fill="#86efac" opacity="0.4"/>
        <circle cx="50" cy="65" r="6" fill="#86efac" opacity="0.4"/>
        <!-- Head -->
        <circle cx="50" cy="30" r="12" fill="#4ade80" stroke="#22c55e" stroke-width="2"/>
        <!-- Eyes -->
        <circle cx="45" cy="28" r="2" fill="black"/>
        <circle cx="55" cy="28" r="2" fill="black"/>
        <!-- Smile -->
        <path d="M47,33 Q50,35 53,33" fill="none" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    </svg>
  `,
  dolphin: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
        <!-- Body -->
        <path d="M10,60 Q20,30 50,30 Q80,30 90,50 Q95,70 75,75 Q50,80 30,70 Q10,65 10,60 Z" fill="#60a5fa" stroke="#3b82f6" stroke-width="2"/>
        <!-- Tail -->
        <path d="M30,70 Q20,85 15,80 Q18,75 30,70 Q20,75 18,70" fill="#60a5fa" stroke="#3b82f6" stroke-width="2"/>
        <!-- Dorsal Fin -->
        <path d="M60,30 Q65,15 68,30" fill="#60a5fa" stroke="#3b82f6" stroke-width="2"/>
        <!-- Snout -->
        <path d="M90,50 L98,52" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>
        <!-- Eye -->
        <circle cx="75" cy="45" r="3" fill="black"/>
        <!-- Smile -->
        <path d="M85,55 Q87,57 89,55" fill="none" stroke="#1e40af" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Belly highlight -->
        <path d="M50,55 Q65,58 80,55" fill="none" stroke="#bfdbfe" stroke-width="2" opacity="0.5"/>
      </g>
    </svg>
  `,
  whale: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
        <!-- Body -->
        <ellipse cx="50" cy="60" rx="40" ry="25" fill="#7dd3fc" stroke="#0ea5e9" stroke-width="2"/>
        <!-- Tail -->
        <path d="M90,60 Q95,50 98,55 M90,60 Q95,70 98,65" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>
        <!-- Fins -->
        <path d="M25,75 Q20,85 30,82" fill="#7dd3fc" stroke="#0ea5e9" stroke-width="2"/>
        <path d="M75,75 Q80,85 70,82" fill="#7dd3fc" stroke="#0ea5e9" stroke-width="2"/>
        <!-- Eye -->
        <circle cx="30" cy="55" r="3" fill="black"/>
        <!-- Smile -->
        <path d="M20,65 Q25,68 30,65" fill="none" stroke="#0c4a6e" stroke-width="2" stroke-linecap="round"/>
        <!-- Blowhole spray -->
        <path d="M45,35 Q43,25 45,20 M50,35 Q50,22 50,18 M55,35 Q57,25 55,20" fill="none" stroke="#bae6fd" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
        <!-- Belly -->
        <path d="M30,70 Q50,75 70,70" fill="none" stroke="#e0f2fe" stroke-width="3" opacity="0.6"/>
      </g>
    </svg>
  `,
  pufferfish: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
        <!-- Body -->
        <circle cx="50" cy="50" r="30" fill="#fde047" stroke="#facc15" stroke-width="2"/>
        <!-- Spikes -->
        <line x1="50" y1="20" x2="50" y2="10" stroke="#eab308" stroke-width="2" stroke-linecap="round"/>
        <line x1="70" y1="25" x2="78" y2="18" stroke="#eab308" stroke-width="2" stroke-linecap="round"/>
        <line x1="80" y1="50" x2="90" y2="50" stroke="#eab308" stroke-width="2" stroke-linecap="round"/>
        <line x1="70" y1="75" x2="78" y2="82" stroke="#eab308" stroke-width="2" stroke-linecap="round"/>
        <line x1="50" y1="80" x2="50" y2="90" stroke="#eab308" stroke-width="2" stroke-linecap="round"/>
        <line x1="30" y1="75" x2="22" y2="82" stroke="#eab308" stroke-width="2" stroke-linecap="round"/>
        <line x1="20" y1="50" x2="10" y2="50" stroke="#eab308" stroke-width="2" stroke-linecap="round"/>
        <line x1="30" y1="25" x2="22" y2="18" stroke="#eab308" stroke-width="2" stroke-linecap="round"/>
        <!-- Spots -->
        <circle cx="40" cy="45" r="3" fill="#ca8a04" opacity="0.6"/>
        <circle cx="60" cy="45" r="3" fill="#ca8a04" opacity="0.6"/>
        <circle cx="50" cy="60" r="3" fill="#ca8a04" opacity="0.6"/>
        <!-- Eyes -->
        <circle cx="42" cy="45" r="4" fill="white"/>
        <circle cx="42" cy="45" r="2" fill="black"/>
        <circle cx="58" cy="45" r="4" fill="white"/>
        <circle cx="58" cy="45" r="2" fill="black"/>
        <!-- Mouth -->
        <path d="M45,55 Q50,57 55,55" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"/>
      </g>
    </svg>
  `,
  pearl: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pearlGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#fdf4ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f5d0fe;stop-opacity:1" />
        </radialGradient>
      </defs>
      <g filter="drop-shadow(2px 3px 3px rgba(0,0,0,0.15))">
        <!-- Main pearl -->
        <circle cx="50" cy="50" r="35" fill="url(#pearlGrad)" stroke="#e9d5ff" stroke-width="2"/>
        <!-- Highlights -->
        <ellipse cx="38" cy="38" rx="12" ry="15" fill="white" opacity="0.6"/>
        <circle cx="60" cy="60" r="5" fill="white" opacity="0.4"/>
        <!-- Subtle shine -->
        <path d="M30,30 Q35,28 40,30" fill="none" stroke="white" stroke-width="3" opacity="0.7" stroke-linecap="round"/>
      </g>
    </svg>
  `,
  anchor: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.2))">
        <!-- Shank -->
        <rect x="47" y="25" width="6" height="50" fill="#64748b" stroke="#475569" stroke-width="2"/>
        <!-- Ring -->
        <circle cx="50" cy="20" r="8" fill="none" stroke="#64748b" stroke-width="5"/>
        <!-- Crown -->
        <path d="M50,75 L30,85 Q25,88 25,80 L30,70" fill="#64748b" stroke="#475569" stroke-width="2"/>
        <path d="M50,75 L70,85 Q75,88 75,80 L70,70" fill="#64748b" stroke="#475569" stroke-width="2"/>
        <!-- Flukes -->
        <circle cx="25" cy="80" r="6" fill="#64748b" stroke="#475569" stroke-width="2"/>
        <circle cx="75" cy="80" r="6" fill="#64748b" stroke="#475569" stroke-width="2"/>
        <!-- Crossbar -->
        <rect x="25" y="42" width="50" height="6" fill="#64748b" stroke="#475569" stroke-width="2"/>
        <!-- Shine -->
        <path d="M50,30 L50,60" stroke="#94a3b8" stroke-width="2" opacity="0.4"/>
      </g>
    </svg>
  `,
  treasure_chest: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.2))">
        <!-- Chest bottom -->
        <rect x="20" y="60" width="60" height="30" fill="#92400e" stroke="#78350f" stroke-width="2"/>
        <!-- Chest top (lid) -->
        <path d="M20,60 Q20,40 50,40 Q80,40 80,60 Z" fill="#b45309" stroke="#78350f" stroke-width="2"/>
        <!-- Lock plate -->
        <rect x="45" y="55" width="10" height="15" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/>
        <!-- Keyhole -->
        <circle cx="50" cy="60" r="2" fill="#92400e"/>
        <rect x="49" y="60" width="2" height="4" fill="#92400e"/>
        <!-- Metal bands -->
        <rect x="18" y="72" width="64" height="3" fill="#78350f"/>
        <rect x="18" y="82" width="64" height="3" fill="#78350f"/>
        <!-- Coins spilling out -->
        <circle cx="75" cy="88" r="4" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/>
        <circle cx="82" cy="85" r="4" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/>
        <circle cx="70" cy="92" r="3" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/>
        <!-- Highlight on lid -->
        <path d="M35,45 Q50,43 65,45" fill="none" stroke="#d97706" stroke-width="2" opacity="0.6"/>
      </g>
    </svg>
  `,
  sea_otter: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
        <!-- Body -->
        <ellipse cx="50" cy="65" rx="22" ry="28" fill="#92400e" stroke="#78350f" stroke-width="2"/>
        <!-- Head -->
        <circle cx="50" cy="35" r="18" fill="#92400e" stroke="#78350f" stroke-width="2"/>
        <!-- Ears -->
        <circle cx="38" cy="25" r="5" fill="#78350f"/>
        <circle cx="62" cy="25" r="5" fill="#78350f"/>
        <!-- Cheeks -->
        <circle cx="35" cy="40" r="8" fill="#a16207" opacity="0.8"/>
        <circle cx="65" cy="40" r="8" fill="#a16207" opacity="0.8"/>
        <!-- Face patch -->
        <ellipse cx="50" cy="42" rx="12" ry="10" fill="#d97706"/>
        <!-- Nose -->
        <circle cx="50" cy="40" r="3" fill="#451a03"/>
        <!-- Eyes -->
        <circle cx="44" cy="33" r="2.5" fill="black"/>
        <circle cx="56" cy="33" r="2.5" fill="black"/>
        <!-- Paws -->
        <ellipse cx="35" cy="75" rx="8" ry="6" fill="#92400e" stroke="#78350f" stroke-width="1.5"/>
        <ellipse cx="65" cy="75" rx="8" ry="6" fill="#92400e" stroke="#78350f" stroke-width="1.5"/>
        <!-- Shell on belly -->
        <ellipse cx="50" cy="72" rx="8" ry="10" fill="#d6d3d1" stroke="#a8a29e" stroke-width="1.5"/>
        <path d="M45,68 Q50,70 55,68" fill="none" stroke="#78716c" stroke-width="1"/>
        <path d="M45,76 Q50,78 55,76" fill="none" stroke="#78716c" stroke-width="1"/>
      </g>
    </svg>
  `,
  penguin: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
        <!-- Body -->
        <ellipse cx="50" cy="60" rx="25" ry="32" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
        <!-- Belly -->
        <ellipse cx="50" cy="62" rx="16" ry="24" fill="white"/>
        <!-- Head -->
        <circle cx="50" cy="30" r="16" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
        <!-- Face patch -->
        <ellipse cx="50" cy="32" rx="11" ry="10" fill="white"/>
        <!-- Eyes -->
        <circle cx="45" cy="28" r="3" fill="black"/>
        <circle cx="55" cy="28" r="3" fill="black"/>
        <circle cx="46" cy="27" r="1" fill="white"/>
        <circle cx="56" cy="27" r="1" fill="white"/>
        <!-- Beak -->
        <path d="M45,35 L50,38 L55,35 Q50,36 45,35" fill="#f97316" stroke="#ea580c" stroke-width="1"/>
        <!-- Wings -->
        <ellipse cx="27" cy="55" rx="8" ry="20" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
        <ellipse cx="73" cy="55" rx="8" ry="20" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
        <!-- Feet -->
        <ellipse cx="42" cy="90" rx="8" ry="5" fill="#f97316" stroke="#ea580c" stroke-width="1.5"/>
        <ellipse cx="58" cy="90" rx="8" ry="5" fill="#f97316" stroke="#ea580c" stroke-width="1.5"/>
        <!-- Blush -->
        <circle cx="38" cy="38" r="3" fill="#fca5a5" opacity="0.5"/>
        <circle cx="62" cy="38" r="3" fill="#fca5a5" opacity="0.5"/>
      </g>
    </svg>
  `,
  mermaid_tail: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mermaidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <g filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.1))">
        <!-- Tail body -->
        <path d="M50,10 Q45,30 40,50 Q35,70 30,85 Q35,95 50,90 Q65,95 70,85 Q65,70 60,50 Q55,30 50,10 Z"
              fill="url(#mermaidGrad)" stroke="#0891b2" stroke-width="2"/>
        <!-- Scales pattern -->
        <path d="M48,25 Q50,27 52,25" fill="none" stroke="#67e8f9" stroke-width="1.5" opacity="0.6"/>
        <path d="M46,35 Q50,37 54,35" fill="none" stroke="#67e8f9" stroke-width="1.5" opacity="0.6"/>
        <path d="M44,45 Q50,47 56,45" fill="none" stroke="#67e8f9" stroke-width="1.5" opacity="0.6"/>
        <path d="M42,55 Q50,57 58,55" fill="none" stroke="#67e8f9" stroke-width="1.5" opacity="0.6"/>
        <path d="M40,65 Q50,67 60,65" fill="none" stroke="#67e8f9" stroke-width="1.5" opacity="0.6"/>
        <path d="M38,75 Q50,77 62,75" fill="none" stroke="#67e8f9" stroke-width="1.5" opacity="0.6"/>
        <!-- Fin left -->
        <path d="M30,85 Q15,88 20,95 Q25,92 30,85" fill="#c084fc" stroke="#a855f7" stroke-width="2"/>
        <!-- Fin right -->
        <path d="M70,85 Q85,88 80,95 Q75,92 70,85" fill="#c084fc" stroke="#a855f7" stroke-width="2"/>
        <!-- Sparkles -->
        <circle cx="45" cy="40" r="2" fill="#fef08a" opacity="0.8"/>
        <circle cx="58" cy="60" r="2" fill="#fef08a" opacity="0.8"/>
        <circle cx="52" cy="70" r="1.5" fill="#fef08a" opacity="0.8"/>
      </g>
    </svg>
  `
};

export const getSvgUrl = (type: string) => {
  const svgString = SVG_STRINGS[type];
  if (!svgString) return '';
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
};

export const StickerAsset: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  if (!SVG_STRINGS[type]) return null;
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: SVG_STRINGS[type] }} />
  );
};