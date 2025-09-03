#!/usr/bin/env python3
"""
Sallie 1.0 Module
Persona: Tough love meets soul care.
Function: Advanced icon generation with open-source graphics integration.
Got it, love.
"""

import os
import sys
import json
import math
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from typing import Dict, List, Tuple, Optional
import colorsys
import random

# Configuration
ASSET_BASE_PATH = "app/icon_pipeline/assets"
OUTPUT_PATH_BASE = "app/icon_pipeline/output"
ICON_SIZES = [48, 72, 96, 144, 192, 512]  # Android icon sizes

class AdvancedIconGenerator:
    """Advanced icon generation with procedural graphics"""
    
    def __init__(self):
        self.ensure_directories()
        
    def ensure_directories(self):
        """Create necessary directories"""
        directories = [
            ASSET_BASE_PATH,
            OUTPUT_PATH_BASE,
            os.path.join(ASSET_BASE_PATH, "base"),
            os.path.join(ASSET_BASE_PATH, "mood"),
            os.path.join(ASSET_BASE_PATH, "season"),
            os.path.join(ASSET_BASE_PATH, "events"),
            os.path.join(OUTPUT_PATH_BASE, "generated"),
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
    
    def generate_procedural_avatar(
        self, 
        size: int = 512,
        style: str = "portrait",
        primary_color: str = "#8b5cf6",
        secondary_color: str = "#f59e0b", 
        mood: str = "confident",
        season: str = "summer",
        hair_style: int = 2,
        eye_style: int = 1,
        accessories: List[str] = None,
        seed: int = 42
    ) -> Image.Image:
        """Generate a procedural avatar using advanced graphics"""
        
        random.seed(seed)
        
        # Create base image with transparency
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Color palette generation
        colors = self.generate_color_palette(primary_color, secondary_color, season)
        
        # Generate components
        self.draw_background(draw, size, style, colors, season)
        self.draw_face(draw, size, colors, mood)
        self.draw_hair(draw, size, hair_style, colors)
        self.draw_eyes(draw, size, eye_style, colors, mood)
        self.draw_mouth(draw, size, colors, mood)
        
        if accessories:
            self.draw_accessories(draw, size, accessories, colors)
        
        # Apply filters and effects
        img = self.apply_visual_effects(img, style, mood)
        
        return img
    
    def generate_color_palette(self, primary: str, secondary: str, season: str) -> Dict[str, Tuple[int, int, int]]:
        """Generate a cohesive color palette"""
        
        def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
        def adjust_brightness(color: Tuple[int, int, int], factor: float) -> Tuple[int, int, int]:
            return tuple(max(0, min(255, int(c * factor))) for c in color)
        
        def blend_colors(color1: Tuple[int, int, int], color2: Tuple[int, int, int], ratio: float = 0.5) -> Tuple[int, int, int]:
            return tuple(int(c1 * (1-ratio) + c2 * ratio) for c1, c2 in zip(color1, color2))
        
        primary_rgb = hex_to_rgb(primary)
        secondary_rgb = hex_to_rgb(secondary)
        
        # Seasonal adjustments
        seasonal_adjustments = {
            'spring': {'brightness': 1.1, 'saturation': 1.15},
            'summer': {'brightness': 1.2, 'saturation': 1.1},
            'autumn': {'brightness': 0.9, 'saturation': 1.2},
            'winter': {'brightness': 0.85, 'saturation': 0.9}
        }
        
        adjustment = seasonal_adjustments.get(season, {'brightness': 1.0, 'saturation': 1.0})
        
        return {
            'primary': primary_rgb,
            'secondary': secondary_rgb,
            'accent': blend_colors(primary_rgb, secondary_rgb, 0.3),
            'light': adjust_brightness(primary_rgb, adjustment['brightness']),
            'dark': adjust_brightness(primary_rgb, 0.7),
            'highlight': adjust_brightness(secondary_rgb, 1.3),
            'shadow': (50, 50, 50),
            'background': (240, 240, 245)
        }
    
    def draw_background(self, draw: ImageDraw.Draw, size: int, style: str, colors: Dict, season: str):
        """Draw background based on style and season"""
        
        center = size // 2
        
        if style == 'geometric':
            # Geometric patterns
            self.draw_geometric_background(draw, size, colors)
        elif style == 'abstract':
            # Abstract flowing shapes
            self.draw_abstract_background(draw, size, colors)
        else:
            # Subtle gradient circle
            for i in range(center, 0, -5):
                alpha = int(255 * (1 - i / center) * 0.1)
                color = (*colors['primary'], alpha)
                draw.ellipse([center-i, center-i, center+i, center+i], fill=color)
        
        # Add seasonal elements
        self.add_seasonal_elements(draw, size, season, colors)
    
    def draw_geometric_background(self, draw: ImageDraw.Draw, size: int, colors: Dict):
        """Draw geometric background patterns"""
        center = size // 2
        
        # Hexagonal pattern
        for ring in range(3):
            radius = center * 0.3 + ring * 40
            for i in range(6):
                angle = i * math.pi / 3
                x = center + radius * math.cos(angle)
                y = center + radius * math.sin(angle)
                
                hex_size = 20 - ring * 3
                points = []
                for j in range(6):
                    hex_angle = j * math.pi / 3
                    px = x + hex_size * math.cos(hex_angle)
                    py = y + hex_size * math.sin(hex_angle)
                    points.append((px, py))
                
                alpha = max(20, 80 - ring * 20)
                color = (*colors['accent'], alpha)
                draw.polygon(points, fill=color)
    
    def draw_abstract_background(self, draw: ImageDraw.Draw, size: int, colors: Dict):
        """Draw abstract flowing background"""
        center = size // 2
        
        # Create flowing organic shapes
        for i in range(5):
            # Generate random organic shape
            points = []
            num_points = 8
            base_radius = center * (0.6 + i * 0.1)
            
            for j in range(num_points):
                angle = (j / num_points) * 2 * math.pi
                # Add noise to create organic shapes
                noise = random.uniform(0.7, 1.3)
                radius = base_radius * noise
                x = center + radius * math.cos(angle)
                y = center + radius * math.sin(angle)
                points.append((x, y))
            
            alpha = max(10, 60 - i * 10)
            color = (*colors['secondary'], alpha)
            draw.polygon(points, fill=color)
    
    def draw_face(self, draw: ImageDraw.Draw, size: int, colors: Dict, mood: str):
        """Draw the face shape"""
        center = size // 2
        face_radius = size * 0.35
        
        # Mood adjustments
        mood_adjustments = {
            'confident': {'scale': 1.05, 'y_offset': -5},
            'calm': {'scale': 0.95, 'y_offset': 0},
            'focused': {'scale': 1.0, 'y_offset': -3},
            'creative': {'scale': 1.03, 'y_offset': -2},
            'determined': {'scale': 1.08, 'y_offset': -8}
        }
        
        adj = mood_adjustments.get(mood, {'scale': 1.0, 'y_offset': 0})
        adjusted_radius = face_radius * adj['scale']
        y_center = center + adj['y_offset']
        
        # Face with gradient effect
        for i in range(int(adjusted_radius), 0, -2):
            alpha = int(255 * (1 - i / adjusted_radius) * 0.3)
            color = (*colors['light'], 255-alpha)
            draw.ellipse([
                center - i, y_center - i,
                center + i, y_center + i
            ], fill=color)
        
        # Main face
        draw.ellipse([
            center - adjusted_radius, y_center - adjusted_radius,
            center + adjusted_radius, y_center + adjusted_radius
        ], fill=colors['primary'])
    
    def draw_hair(self, draw: ImageDraw.Draw, size: int, hair_style: int, colors: Dict):
        """Draw hair based on style"""
        center = size // 2
        hair_color = colors['dark']
        
        hair_styles = {
            0: self.draw_hair_classic,
            1: self.draw_hair_pixie,
            2: self.draw_hair_bob,
            3: self.draw_hair_curly,
            4: self.draw_hair_braided,
            5: self.draw_hair_long,
            6: self.draw_hair_afro,
            7: self.draw_hair_updo,
            8: self.draw_hair_modern
        }
        
        hair_function = hair_styles.get(hair_style, self.draw_hair_classic)
        hair_function(draw, size, center, hair_color, colors)
    
    def draw_hair_classic(self, draw, size, center, hair_color, colors):
        """Draw classic hair style"""
        hair_radius = size * 0.4
        draw.ellipse([
            center - hair_radius, center * 0.4 - hair_radius * 0.8,
            center + hair_radius, center * 0.4 + hair_radius * 0.8
        ], fill=hair_color)
    
    def draw_hair_pixie(self, draw, size, center, hair_color, colors):
        """Draw pixie cut"""
        # Short, textured hair
        for i in range(20):
            angle = random.uniform(0, 2 * math.pi)
            distance = random.uniform(size * 0.25, size * 0.35)
            x = center + distance * math.cos(angle)
            y = center * 0.6 + distance * math.sin(angle) * 0.7
            
            radius = random.uniform(8, 15)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=hair_color)
    
    def draw_hair_bob(self, draw, size, center, hair_color, colors):
        """Draw professional bob"""
        # Structured bob shape
        points = []
        for angle in [math.pi * i / 8 for i in range(-4, 5)]:
            radius = size * 0.38
            x = center + radius * math.cos(angle + math.pi/2)
            y = center * 0.5 + radius * math.sin(angle + math.pi/2) * 0.8
            points.append((x, y))
        
        draw.polygon(points, fill=hair_color)
        
        # Add highlights
        highlight_color = colors['highlight']
        for i in range(3):
            x = center - size * 0.2 + i * size * 0.2
            y = center * 0.4
            draw.ellipse([x-10, y-5, x+10, y+5], fill=highlight_color)
    
    def draw_hair_curly(self, draw, size, center, hair_color, colors):
        """Draw curly hair"""
        # Multiple circles for curls
        curl_positions = [
            (center - size * 0.25, center * 0.4),
            (center + size * 0.25, center * 0.4),
            (center - size * 0.15, center * 0.3),
            (center + size * 0.15, center * 0.3),
            (center, center * 0.25)
        ]
        
        for x, y in curl_positions:
            for radius in [25, 20, 15]:
                alpha = 255 - (25 - radius) * 8
                color = (*hair_color, alpha) if len(hair_color) == 3 else hair_color
                draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)
    
    def draw_hair_braided(self, draw, size, center, hair_color, colors):
        """Draw braided hair"""
        # Base hair shape
        self.draw_hair_classic(draw, size, center, hair_color, colors)
        
        # Braid pattern
        braid_color = colors['highlight']
        for i in range(3):
            y = center * 0.5 + i * 20
            x1 = center - 30 + (i % 2) * 20
            x2 = center + 30 - (i % 2) * 20
            draw.line([(x1, y), (x2, y)], fill=braid_color, width=3)
    
    def draw_hair_long(self, draw, size, center, hair_color, colors):
        """Draw long flowing hair"""
        # Extended hair shape
        points = []
        for angle in [math.pi * i / 12 for i in range(-6, 7)]:
            if abs(angle) < math.pi / 3:
                radius = size * 0.45  # Longer in front
            else:
                radius = size * 0.35
            
            x = center + radius * math.cos(angle + math.pi/2)
            y = center * 0.3 + radius * math.sin(angle + math.pi/2) * 1.2
            points.append((x, y))
        
        draw.polygon(points, fill=hair_color)
        
        # Add flowing effect
        for i in range(5):
            wave_y = center * 0.7 + i * 15
            wave_points = []
            for j in range(10):
                x = center - size * 0.3 + j * size * 0.06
                y = wave_y + 10 * math.sin(j * 0.5 + i)
                wave_points.append((x, y))
            
            if len(wave_points) > 1:
                draw.line(wave_points, fill=colors['highlight'], width=2)
    
    def draw_hair_afro(self, draw, size, center, hair_color, colors):
        """Draw afro hairstyle"""
        # Multiple overlapping circles for texture
        afro_radius = size * 0.45
        
        for i in range(50):
            angle = random.uniform(0, 2 * math.pi)
            distance = random.uniform(0, afro_radius)
            x = center + distance * math.cos(angle)
            y = center * 0.5 + distance * math.sin(angle) * 0.9
            
            radius = random.uniform(12, 25)
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=hair_color)
    
    def draw_hair_updo(self, draw, size, center, hair_color, colors):
        """Draw updo hairstyle"""
        # Elegant updo shape
        updo_center_y = center * 0.35
        draw.ellipse([
            center - size * 0.25, updo_center_y - size * 0.15,
            center + size * 0.25, updo_center_y + size * 0.15
        ], fill=hair_color)
        
        # Hair pins/decorative elements
        pin_color = colors['accent']
        for i in range(3):
            x = center - 20 + i * 20
            y = updo_center_y
            draw.ellipse([x-3, y-3, x+3, y+3], fill=pin_color)
    
    def draw_hair_modern(self, draw, size, center, hair_color, colors):
        """Draw modern edgy hair"""
        # Asymmetric cut
        left_points = [
            (center - size * 0.4, center * 0.6),
            (center - size * 0.2, center * 0.3),
            (center, center * 0.25),
            (center - size * 0.3, center * 0.8)
        ]
        
        right_points = [
            (center, center * 0.25),
            (center + size * 0.3, center * 0.3),
            (center + size * 0.35, center * 0.7),
            (center + size * 0.2, center * 0.8)
        ]
        
        draw.polygon(left_points, fill=hair_color)
        draw.polygon(right_points, fill=hair_color)
        
        # Add highlights
        highlight_color = colors['highlight']
        draw.polygon([
            (center - size * 0.1, center * 0.3),
            (center + size * 0.1, center * 0.25),
            (center + size * 0.15, center * 0.4),
            (center - size * 0.05, center * 0.45)
        ], fill=highlight_color)
    
    def draw_eyes(self, draw: ImageDraw.Draw, size: int, eye_style: int, colors: Dict, mood: str):
        """Draw eyes based on style and mood"""
        center = size // 2
        eye_y = center * 0.85
        eye_distance = size * 0.15
        
        left_eye_x = center - eye_distance
        right_eye_x = center + eye_distance
        
        eye_color = colors['dark']
        highlight_color = (255, 255, 255)
        
        eye_styles = {
            0: self.draw_eyes_round,
            1: self.draw_eyes_almond,
            2: self.draw_eyes_wide,
            3: self.draw_eyes_focused,
            4: self.draw_eyes_artistic
        }
        
        eye_function = eye_styles.get(eye_style, self.draw_eyes_round)
        eye_function(draw, left_eye_x, right_eye_x, eye_y, eye_color, highlight_color, mood)
    
    def draw_eyes_round(self, draw, left_x, right_x, y, eye_color, highlight_color, mood):
        """Draw round eyes"""
        radius = 12
        
        # Eye base
        draw.ellipse([left_x-radius, y-radius, left_x+radius, y+radius], fill=eye_color)
        draw.ellipse([right_x-radius, y-radius, right_x+radius, y+radius], fill=eye_color)
        
        # Highlights
        highlight_radius = 4
        draw.ellipse([left_x-highlight_radius, y-6-highlight_radius, 
                     left_x+highlight_radius, y-6+highlight_radius], fill=highlight_color)
        draw.ellipse([right_x-highlight_radius, y-6-highlight_radius, 
                     right_x+highlight_radius, y-6+highlight_radius], fill=highlight_color)
    
    def draw_eyes_almond(self, draw, left_x, right_x, y, eye_color, highlight_color, mood):
        """Draw almond-shaped eyes"""
        # Almond shapes using polygons
        left_points = [(left_x-15, y), (left_x-5, y-8), (left_x+5, y-8), (left_x+15, y),
                       (left_x+5, y+8), (left_x-5, y+8)]
        right_points = [(right_x-15, y), (right_x-5, y-8), (right_x+5, y-8), (right_x+15, y),
                        (right_x+5, y+8), (right_x-5, y+8)]
        
        draw.polygon(left_points, fill=eye_color)
        draw.polygon(right_points, fill=eye_color)
        
        # Highlights
        draw.ellipse([left_x-3, y-5, left_x+3, y-2], fill=highlight_color)
        draw.ellipse([right_x-3, y-5, right_x+3, y-2], fill=highlight_color)
    
    def draw_eyes_wide(self, draw, left_x, right_x, y, eye_color, highlight_color, mood):
        """Draw wide eyes"""
        width = 20
        height = 8
        
        draw.ellipse([left_x-width, y-height, left_x+width, y+height], fill=eye_color)
        draw.ellipse([right_x-width, y-height, right_x+width, y+height], fill=eye_color)
        
        # Large highlights
        draw.ellipse([left_x-6, y-4, left_x+6, y+2], fill=highlight_color)
        draw.ellipse([right_x-6, y-4, right_x+6, y+2], fill=highlight_color)
    
    def draw_eyes_focused(self, draw, left_x, right_x, y, eye_color, highlight_color, mood):
        """Draw focused/intense eyes"""
        # Narrower, more intense shape
        points_left = [(left_x-12, y-5), (left_x+12, y-8), (left_x+12, y+8), (left_x-12, y+5)]
        points_right = [(right_x-12, y-8), (right_x+12, y-5), (right_x+12, y+5), (right_x-12, y+8)]
        
        draw.polygon(points_left, fill=eye_color)
        draw.polygon(points_right, fill=eye_color)
        
        # Small, intense highlights
        draw.ellipse([left_x-2, y-3, left_x+2, y-1], fill=highlight_color)
        draw.ellipse([right_x-2, y-3, right_x+2, y-1], fill=highlight_color)
    
    def draw_eyes_artistic(self, draw, left_x, right_x, y, eye_color, highlight_color, mood):
        """Draw artistic/creative eyes"""
        # Unique asymmetric shapes
        # Left eye - teardrop
        left_points = [(left_x-10, y), (left_x-5, y-12), (left_x+8, y-5), (left_x+8, y+5), (left_x-5, y+8)]
        # Right eye - angular
        right_points = [(right_x-8, y-8), (right_x+10, y-6), (right_x+12, y+2), (right_x-6, y+8)]
        
        draw.polygon(left_points, fill=eye_color)
        draw.polygon(right_points, fill=eye_color)
        
        # Creative highlights
        draw.ellipse([left_x-1, y-6, left_x+3, y-2], fill=highlight_color)
        draw.polygon([(right_x-2, y-4), (right_x+4, y-3), (right_x+2, y+1)], fill=highlight_color)
    
    def draw_mouth(self, draw: ImageDraw.Draw, size: int, colors: Dict, mood: str):
        """Draw mouth based on mood"""
        center = size // 2
        mouth_y = center * 1.2
        
        mouth_color = colors['accent']
        
        mood_mouths = {
            'confident': [(center-15, mouth_y), (center, mouth_y+8), (center+15, mouth_y)],
            'calm': [(center-12, mouth_y), (center, mouth_y+4), (center+12, mouth_y)],
            'focused': [(center-10, mouth_y), (center+10, mouth_y)],  # Straight line
            'creative': [(center-20, mouth_y), (center-5, mouth_y+10), (center+5, mouth_y-2), (center+20, mouth_y+5)],
            'determined': [(center-18, mouth_y-2), (center, mouth_y+6), (center+18, mouth_y-2)]
        }
        
        mouth_points = mood_mouths.get(mood, mood_mouths['confident'])
        
        if len(mouth_points) == 2:  # Straight line
            draw.line(mouth_points, fill=mouth_color, width=3)
        else:  # Curved mouth
            if len(mouth_points) == 3:
                # Simple curve approximation
                draw.polygon(mouth_points, fill=mouth_color)
            else:
                # Complex curve
                draw.line(mouth_points, fill=mouth_color, width=2)
    
    def draw_accessories(self, draw: ImageDraw.Draw, size: int, accessories: List[str], colors: Dict):
        """Draw accessories"""
        center = size // 2
        
        if 'glasses' in accessories:
            self.draw_glasses(draw, center, size, colors)
        
        if 'earrings' in accessories:
            self.draw_earrings(draw, center, size, colors)
        
        if 'necklace' in accessories:
            self.draw_necklace(draw, center, size, colors)
    
    def draw_glasses(self, draw, center, size, colors):
        """Draw glasses"""
        glass_color = colors['dark']
        eye_y = center * 0.85
        eye_distance = size * 0.15
        
        # Lens frames
        radius = 18
        draw.ellipse([center-eye_distance-radius, eye_y-radius, 
                     center-eye_distance+radius, eye_y+radius], 
                     outline=glass_color, width=3)
        draw.ellipse([center+eye_distance-radius, eye_y-radius, 
                     center+eye_distance+radius, eye_y+radius], 
                     outline=glass_color, width=3)
        
        # Bridge
        draw.line([(center-eye_distance+radius, eye_y), 
                   (center+eye_distance-radius, eye_y)], 
                  fill=glass_color, width=2)
    
    def draw_earrings(self, draw, center, size, colors):
        """Draw earrings"""
        earring_color = colors['accent']
        ear_y = center * 1.0
        ear_distance = size * 0.25
        
        # Simple drop earrings
        draw.ellipse([center-ear_distance-4, ear_y-4, 
                     center-ear_distance+4, ear_y+4], fill=earring_color)
        draw.ellipse([center+ear_distance-4, ear_y-4, 
                     center+ear_distance+4, ear_y+4], fill=earring_color)
    
    def draw_necklace(self, draw, center, size, colors):
        """Draw necklace"""
        necklace_color = colors['accent']
        necklace_y = center * 1.45
        
        # Necklace chain
        for i in range(-5, 6):
            x = center + i * 8
            y = necklace_y + abs(i) * 2  # Slight curve
            draw.ellipse([x-2, y-2, x+2, y+2], fill=necklace_color)
        
        # Pendant
        draw.ellipse([center-6, necklace_y+10-6, center+6, necklace_y+10+6], fill=necklace_color)
    
    def add_seasonal_elements(self, draw: ImageDraw.Draw, size: int, season: str, colors: Dict):
        """Add seasonal decorative elements"""
        
        seasonal_elements = {
            'spring': self.add_spring_elements,
            'summer': self.add_summer_elements,
            'autumn': self.add_autumn_elements,
            'winter': self.add_winter_elements
        }
        
        element_function = seasonal_elements.get(season)
        if element_function:
            element_function(draw, size, colors)
    
    def add_spring_elements(self, draw, size, colors):
        """Add spring elements (flowers, leaves)"""
        # Small flowers in corners
        positions = [(size*0.1, size*0.1), (size*0.9, size*0.1), (size*0.9, size*0.9)]
        
        for x, y in positions:
            # Simple flower
            petals = 5
            for i in range(petals):
                angle = (i / petals) * 2 * math.pi
                px = x + 8 * math.cos(angle)
                py = y + 8 * math.sin(angle)
                draw.ellipse([px-3, py-3, px+3, py+3], fill=colors['highlight'])
            
            # Center
            draw.ellipse([x-2, y-2, x+2, y+2], fill=colors['accent'])
    
    def add_summer_elements(self, draw, size, colors):
        """Add summer elements (sun rays, bright accents)"""
        center = size // 2
        
        # Sun rays
        for i in range(8):
            angle = (i / 8) * 2 * math.pi
            start_radius = size * 0.45
            end_radius = size * 0.48
            
            x1 = center + start_radius * math.cos(angle)
            y1 = center + start_radius * math.sin(angle)
            x2 = center + end_radius * math.cos(angle)
            y2 = center + end_radius * math.sin(angle)
            
            draw.line([(x1, y1), (x2, y2)], fill=colors['highlight'], width=2)
    
    def add_autumn_elements(self, draw, size, colors):
        """Add autumn elements (leaves, warm tones)"""
        # Falling leaves
        leaf_positions = [(size*0.2, size*0.3), (size*0.8, size*0.7), (size*0.1, size*0.8)]
        
        for x, y in leaf_positions:
            # Simple leaf shape
            points = [(x, y-8), (x+6, y), (x, y+8), (x-6, y)]
            draw.polygon(points, fill=colors['secondary'])
    
    def add_winter_elements(self, draw, size, colors):
        """Add winter elements (snowflakes, crystals)"""
        # Snowflakes
        flake_positions = [(size*0.15, size*0.2), (size*0.85, size*0.3), (size*0.2, size*0.8)]
        
        for x, y in flake_positions:
            # Simple snowflake
            draw.line([(x-6, y), (x+6, y)], fill=colors['highlight'], width=2)
            draw.line([(x, y-6), (x, y+6)], fill=colors['highlight'], width=2)
            draw.line([(x-4, y-4), (x+4, y+4)], fill=colors['highlight'], width=1)
            draw.line([(x-4, y+4), (x+4, y-4)], fill=colors['highlight'], width=1)
    
    def apply_visual_effects(self, img: Image.Image, style: str, mood: str) -> Image.Image:
        """Apply visual effects based on style and mood"""
        
        # Style-based effects
        if style == 'geometric':
            # Sharper, more defined
            img = img.filter(ImageFilter.SHARPEN)
        elif style == 'abstract':
            # Slightly blurred for dreamy effect
            img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
        elif style == 'artistic':
            # Enhanced contrast
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)
        
        # Mood-based effects
        if mood == 'creative':
            # Slightly more saturated
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.15)
        elif mood == 'calm':
            # Softer, less saturated
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(0.9)
        
        return img
    
    def generate_icon_set(self, config: Dict) -> Dict[int, Image.Image]:
        """Generate a complete icon set for different sizes"""
        icons = {}
        
        # Filter config to only include valid parameters
        valid_params = {
            'size', 'style', 'primary_color', 'secondary_color', 'mood', 
            'season', 'hair_style', 'eye_style', 'accessories', 'seed'
        }
        filtered_config = {k: v for k, v in config.items() if k in valid_params}
        
        # Generate base avatar at largest size
        base_avatar = self.generate_procedural_avatar(
            size=512,
            **filtered_config
        )
        
        # Create different sizes
        for size in ICON_SIZES:
            if size == 512:
                icons[size] = base_avatar
            else:
                # Resize with high quality
                resized = base_avatar.resize((size, size), Image.LANCZOS)
                icons[size] = resized
        
        return icons
    
    def save_icon_set(self, icons: Dict[int, Image.Image], name: str):
        """Save icon set to files"""
        for size, icon in icons.items():
            filename = f"{name}_{size}x{size}.png"
            filepath = os.path.join(OUTPUT_PATH_BASE, "generated", filename)
            icon.save(filepath, "PNG")
            print(f"Saved: {filename}")
    
    def generate_adaptive_icon_xml(self, name: str, foreground_file: str, background_file: str = None) -> str:
        """Generate Android adaptive icon XML"""
        
        background_xml = f'<background android:drawable="@drawable/{background_file}"/>' if background_file else '<background android:drawable="@color/ic_launcher_background"/>'
        
        return f'''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    {background_xml}
    <foreground android:drawable="@drawable/{foreground_file}"/>
</adaptive-icon>'''

def main():
    """Main function to generate icons"""
    generator = AdvancedIconGenerator()
    
    # Example configurations for different personas and moods
    configurations = [
        {
            'name': 'grace_and_grind',
            'style': 'portrait',
            'primary_color': '#8b5cf6',
            'secondary_color': '#f59e0b',
            'mood': 'confident',
            'season': 'summer',
            'hair_style': 2,
            'eye_style': 1,
            'accessories': ['earrings'],
            'seed': 42
        },
        {
            'name': 'southern_grit',
            'style': 'artistic',
            'primary_color': '#d97706',
            'secondary_color': '#92400e',
            'mood': 'determined',
            'season': 'autumn',
            'hair_style': 4,
            'eye_style': 2,
            'accessories': [],
            'seed': 123
        },
        {
            'name': 'midnight_hustle',
            'style': 'minimal',
            'primary_color': '#1f2937',
            'secondary_color': '#6366f1',
            'mood': 'focused',
            'season': 'winter',
            'hair_style': 1,
            'eye_style': 3,
            'accessories': ['glasses'],
            'seed': 456
        },
        {
            'name': 'soul_care',
            'style': 'abstract',
            'primary_color': '#059669',
            'secondary_color': '#10b981',
            'mood': 'calm',
            'season': 'spring',
            'hair_style': 6,
            'eye_style': 0,
            'accessories': ['necklace'],
            'seed': 789
        },
        {
            'name': 'creative_vision',
            'style': 'geometric',
            'primary_color': '#7c3aed',
            'secondary_color': '#fbbf24',
            'mood': 'creative',
            'season': 'summer',
            'hair_style': 8,
            'eye_style': 4,
            'accessories': ['glasses', 'earrings'],
            'seed': 999
        }
    ]
    
    print("🎨 Generating advanced Sallie avatar icons...")
    
    for config in configurations:
        print(f"Generating {config['name']}...")
        
        # Generate icon set
        icons = generator.generate_icon_set(config)
        
        # Save icons
        generator.save_icon_set(icons, config['name'])
        
        # Generate XML for adaptive icons
        xml_content = generator.generate_adaptive_icon_xml(
            config['name'],
            f"{config['name']}_foreground",
            f"{config['name']}_background"
        )
        
        # Save XML file
        xml_path = os.path.join(OUTPUT_PATH_BASE, f"ic_launcher_{config['name']}.xml")
        with open(xml_path, 'w') as f:
            f.write(xml_content)
        
        print(f"Generated {config['name']} icon set with {len(icons)} sizes")
    
    print(f"✨ Complete! Generated {len(configurations)} icon sets")
    print(f"Icons saved to: {OUTPUT_PATH_BASE}")

if __name__ == "__main__":
    main()