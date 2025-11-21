
import React, { useRef, useEffect, useCallback } from 'react';
import { Entity, EntityType, Particle, LevelTheme } from '../types';
import { 
  GRAVITY, JUMP_STRENGTH, GROUND_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, 
  GAME_SPEED_START, SPAWN_RATE_MIN, SPAWN_RATE_MAX, THEMES, COLORS, MAX_SPEED, ACCELERATION 
} from '../constants';

interface GameCanvasProps {
  onGameOver: (score: number, treats: number) => void;
  onScoreUpdate: (score: number) => void;
  onTreatUpdate: (treats: number) => void;
  theme: LevelTheme;
  onThemeChange: (theme: LevelTheme) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onGameOver, 
  onScoreUpdate, 
  onTreatUpdate,
  theme,
  onThemeChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  
  // Game State Refs (mutable for performance)
  const playerRef = useRef({
    x: 50,
    y: 0, // will be set relative to canvas height
    vy: 0,
    isJumping: false,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    rotation: 0,
    runFrame: 0
  });
  
  const entitiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const gameSpeedRef = useRef(GAME_SPEED_START);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0); // separate distance tracker
  const treatsRef = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const nextSpawnTime = useRef(0);

  // Helper: Draw Pixel Art Spaniel
  const drawSpaniel = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isJumping: boolean, runFrame: number) => {
    const bounce = isJumping ? -5 : Math.sin(runFrame * 0.2) * 3;
    
    // Body
    ctx.fillStyle = COLORS.spanielWhite;
    ctx.fillRect(x, y + bounce, w, h);
    
    // Patches (Blenheim spots)
    ctx.fillStyle = COLORS.spanielBrown;
    ctx.fillRect(x + 10, y + bounce + 5, 15, 15);
    ctx.fillRect(x + 35, y + bounce, 10, 10);

    // Head
    const headSize = 25;
    const headX = x + w - 15;
    const headY = y - 15 + bounce;
    ctx.fillStyle = COLORS.spanielWhite;
    ctx.fillRect(headX, headY, headSize, headSize);
    
    // Ears (Long and floppy)
    ctx.fillStyle = COLORS.spanielEar;
    const earAngle = isJumping ? -0.5 : Math.sin(runFrame * 0.2) * 0.2;
    
    ctx.save();
    ctx.translate(headX + 5, headY + 5);
    ctx.rotate(earAngle);
    ctx.fillRect(-5, 0, 10, 25); // Left Ear
    ctx.restore();

    // Right ear (slightly offset)
    ctx.save();
    ctx.translate(headX + 20, headY + 5);
    ctx.rotate(earAngle);
    ctx.fillRect(-5, 0, 10, 25);
    ctx.restore();

    // Eyes & Nose
    ctx.fillStyle = '#000';
    ctx.fillRect(headX + 12, headY + 8, 3, 3); // Eye
    ctx.fillRect(headX + 18, headY + 15, 4, 3); // Nose

    // Tail (Wagging)
    ctx.strokeStyle = COLORS.spanielWhite;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y + 10 + bounce);
    ctx.lineTo(x - 15, y + 5 + bounce + Math.sin(runFrame * 0.5) * 10);
    ctx.stroke();
  };

  // Helper: Draw Squirrel
  const drawSquirrel = (ctx: CanvasRenderingContext2D, entity: Entity) => {
    const { x, y } = entity;
    
    // Tail (Bushy)
    ctx.fillStyle = '#E65100'; // Darker orange for tail shade
    ctx.beginPath();
    ctx.ellipse(x + 35, y + 10, 15, 20, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = COLORS.squirrel;
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 20, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(x + 5, y + 12, 8, 0, Math.PI * 2);
    ctx.fill();

    // Ear
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 6);
    ctx.lineTo(x + 2, y - 2);
    ctx.lineTo(x + 8, y + 4);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x + 3, y + 10, 1.5, 0, Math.PI * 2);
    ctx.fill();
  };

  // Helper: Create particles
  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
  };

  // Game Loop
  const update = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const groundY = height - GROUND_HEIGHT;

    // --- Physics & Logic ---

    // Player Physics
    const player = playerRef.current;
    player.vy += GRAVITY;
    player.y += player.vy;

    // Ground Collision
    if (player.y + player.height >= groundY) {
      player.y = groundY - player.height;
      player.vy = 0;
      player.isJumping = false;
    } else {
      player.isJumping = true;
    }

    // Jump Input
    if ((keysPressed.current.has(' ') || keysPressed.current.has('ArrowUp') || keysPressed.current.has('Click')) && !player.isJumping) {
      player.vy = JUMP_STRENGTH;
      player.isJumping = true;
      keysPressed.current.delete('Click'); // Consumed tap
    }
    
    // Animation Frame
    player.runFrame++;

    // Difficulty & Speed
    gameSpeedRef.current = Math.min(MAX_SPEED, gameSpeedRef.current + ACCELERATION);
    scoreRef.current += 1; // Score based on time/distance
    distanceRef.current += gameSpeedRef.current;

    // Theme Transition Logic (every 2000 distance units)
    const distanceMilestone = Math.floor(distanceRef.current / 2000);
    const themes = Object.values(LevelTheme);
    const targetTheme = themes[distanceMilestone % themes.length];
    if (targetTheme !== theme) {
      onThemeChange(targetTheme);
    }

    // Spawning Entities
    frameCountRef.current++;
    if (frameCountRef.current > nextSpawnTime.current) {
      const rand = Math.random();
      
      // Spawn Logic Weights
      // 30% Collectible
      // 70% Obstacle
      
      let type = EntityType.COLLECTIBLE;
      let eY = groundY;
      let eW = 40;
      let eH = 40;

      if (rand > 0.3) {
        // Obstacle Selection
        const obsRoll = Math.random();
        
        if (obsRoll < 0.25) {
          type = EntityType.OBSTACLE_GROUND; // Puddle
          eW = 50; eH = 15;
          eY = groundY - eH;
        } else if (obsRoll < 0.50) {
          type = EntityType.OBSTACLE_BUSH; // Bush
          eW = 60; eH = 40;
          eY = groundY - eH;
        } else if (obsRoll < 0.65) {
          type = EntityType.OBSTACLE_POOP; // Poop
          eW = 25; eH = 20;
          eY = groundY - eH;
        } else if (obsRoll < 0.85) {
          type = EntityType.OBSTACLE_AIR; // Squirrel
          eW = 50; eH = 30;
          eY = groundY - 90 - (Math.random() * 40);
        } else {
          type = EntityType.OBSTACLE_DOG; // Other Dog
          eW = 60; eH = 50;
          eY = groundY - eH;
        }
      } else {
        // Collectible
        type = EntityType.COLLECTIBLE;
        eW = 25; eH = 25;
        eY = groundY - 30 - (Math.random() * 100);
      }

      entitiesRef.current.push({
        id: Math.random(),
        type,
        x: width,
        y: eY,
        width: eW,
        height: eH,
        markedForDeletion: false,
        variant: Math.floor(Math.random() * 3)
      });

      nextSpawnTime.current = frameCountRef.current + (Math.random() * (SPAWN_RATE_MAX - SPAWN_RATE_MIN) + SPAWN_RATE_MIN) / (gameSpeedRef.current / GAME_SPEED_START);
    }

    // Update Entities
    entitiesRef.current.forEach(entity => {
      entity.x -= gameSpeedRef.current;
      
      // Collision Detection (AABB)
      const pLeft = player.x + 15; // Hitbox adjustment (tighter)
      const pRight = player.x + player.width - 15;
      const pTop = player.y + 10;
      const pBottom = player.y + player.height - 5;

      const eLeft = entity.x + 5;
      const eRight = entity.x + entity.width - 5;
      const eTop = entity.y + 5;
      const eBottom = entity.y + entity.height - 5;

      if (pLeft < eRight && pRight > eLeft && pTop < eBottom && pBottom > eTop) {
        if (entity.type === EntityType.COLLECTIBLE) {
          entity.markedForDeletion = true;
          treatsRef.current += 1;
          scoreRef.current += 50;
          createParticles(entity.x + entity.width/2, entity.y + entity.height/2, COLORS.bone, 5);
        } else {
          // Game Over
          cancelAnimationFrame(requestRef.current!);
          onGameOver(scoreRef.current, treatsRef.current);
          return;
        }
      }

      if (entity.x + entity.width < 0) {
        entity.markedForDeletion = true;
      }
    });

    // Remove deleted entities
    entitiesRef.current = entitiesRef.current.filter(e => !e.markedForDeletion);

    // Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);


    // --- Rendering ---
    
    const currentThemeColors = THEMES[theme];

    // Sky
    ctx.fillStyle = currentThemeColors.sky;
    ctx.fillRect(0, 0, width, height);

    // Background Elements (Clouds/Trees - Simple Parallax)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    const cloudOffset = (frameCountRef.current * 0.5) % width;
    ctx.beginPath();
    ctx.arc(width - cloudOffset, 50, 30, 0, Math.PI * 2);
    ctx.arc(width - cloudOffset + 40, 60, 40, 0, Math.PI * 2);
    ctx.fill();

    // Ground
    ctx.fillStyle = currentThemeColors.ground;
    ctx.fillRect(0, groundY, width, GROUND_HEIGHT);
    
    // Ground Detail (Stripes for speed illusion)
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    const stripeOffset = (distanceRef.current) % 50;
    for(let i = 0; i < width + 50; i+=50) {
      ctx.fillRect(i - stripeOffset, groundY, 20, GROUND_HEIGHT);
    }
    
    // Draw Entities
    entitiesRef.current.forEach(entity => {
      if (entity.type === EntityType.COLLECTIBLE) {
        // Treat/Bone
        ctx.fillStyle = COLORS.bone;
        ctx.beginPath(); // Bone shape simplified
        ctx.arc(entity.x, entity.y + 5, 8, 0, Math.PI * 2);
        ctx.arc(entity.x, entity.y + 15, 8, 0, Math.PI * 2);
        ctx.fillRect(entity.x, entity.y + 5, 25, 10);
        ctx.arc(entity.x + 25, entity.y + 5, 8, 0, Math.PI * 2);
        ctx.arc(entity.x + 25, entity.y + 15, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (entity.type === EntityType.OBSTACLE_AIR) {
        drawSquirrel(ctx, entity);
      } else if (entity.type === EntityType.OBSTACLE_BUSH) {
        // Bush
        ctx.fillStyle = COLORS.bush;
        ctx.beginPath();
        ctx.arc(entity.x + 15, entity.y + 25, 15, 0, Math.PI * 2);
        ctx.arc(entity.x + 30, entity.y + 15, 20, 0, Math.PI * 2);
        ctx.arc(entity.x + 45, entity.y + 25, 15, 0, Math.PI * 2);
        ctx.fill();
      } else if (entity.type === EntityType.OBSTACLE_POOP) {
        // Poop Pile
        ctx.fillStyle = COLORS.poop;
        ctx.beginPath();
        ctx.moveTo(entity.x, entity.y + entity.height);
        ctx.lineTo(entity.x + entity.width, entity.y + entity.height);
        ctx.lineTo(entity.x + entity.width / 2, entity.y);
        ctx.fill();
        // Stink lines
        if (frameCountRef.current % 20 < 10) {
          ctx.strokeStyle = '#8D6E63';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(entity.x + 10, entity.y);
          ctx.lineTo(entity.x + 10, entity.y - 10);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(entity.x + 15, entity.y + 5);
          ctx.lineTo(entity.x + 18, entity.y - 5);
          ctx.stroke();
        }
      } else if (entity.type === EntityType.OBSTACLE_DOG) {
        // Other Dog (Golden Retriever style)
        ctx.fillStyle = COLORS.goldenDog;
        ctx.fillRect(entity.x, entity.y + 10, 45, 30); // Body
        ctx.fillRect(entity.x - 15, entity.y, 25, 25); // Head (Facing left)
        ctx.fillStyle = '#E65100'; // Ear
        ctx.fillRect(entity.x - 5, entity.y + 5, 8, 15);
        // Legs
        ctx.fillStyle = COLORS.goldenDog;
        ctx.fillRect(entity.x + 5, entity.y + 40, 10, 10);
        ctx.fillRect(entity.x + 30, entity.y + 40, 10, 10);
        // Tail
        ctx.fillRect(entity.x + 45, entity.y + 10, 10, 5);
      } else {
        // Puddle (Ground Generic)
        ctx.fillStyle = COLORS.puddle;
        ctx.beginPath();
        ctx.ellipse(entity.x + entity.width/2, entity.y + entity.height/2, entity.width/2, entity.height/4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Player
    drawSpaniel(ctx, player.x, player.y, player.width, player.height, player.isJumping, player.runFrame);

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 5, 5);
      ctx.globalAlpha = 1.0;
    });

    // Sync State for UI (Debounced slightly if needed, but fine for now)
    if (frameCountRef.current % 10 === 0) {
       onScoreUpdate(Math.floor(scoreRef.current));
       onTreatUpdate(treatsRef.current);
    }

    requestRef.current = requestAnimationFrame(update);
  }, [theme, onGameOver, onScoreUpdate, onTreatUpdate, onThemeChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key);
    const handleTouchStart = () => keysPressed.current.add('Click');
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('mousedown', handleTouchStart);

    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousedown', handleTouchStart);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={400} 
      className="w-full h-full max-w-4xl max-h-[500px] border-4 border-[#8D6E63] rounded-lg shadow-2xl bg-sky-200 touch-none cursor-pointer"
    />
  );
};
