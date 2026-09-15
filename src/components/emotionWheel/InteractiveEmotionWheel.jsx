import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  EMOTION_WHEEL_TAXONOMY,
  ALL_EMOTIONS_FLAT
} from '../../data/emotionWheelTaxonomy';

/**
 * InteractiveEmotionWheel:
 * Mathematically recomputed Focused Radial Emotion Landscape.
 * 
 * Optimal Dynamic Label Angles:
 * - Every segment dynamically calculates its natural, readable angle based on its position on the wheel.
 * - Top quadrant labels (like "Withdrawn", "Critical", "Distant") are horizontally/gently curved for instant readability.
 * - Side and bottom quadrants adapt naturally to stay within comfortable ±30° horizontal reading angles.
 * - No vertical or upside-down text anywhere on the wheel.
 */
export default function InteractiveEmotionWheel({
  selectedFamily,
  selectedCategory,
  selectedEmotion,
  onSelectFamily,
  onSelectCategory,
  onSelectEmotion,
  onBackLevel,
  isDimmedForFlow = false
}) {
  const [hoveredFamily, setHoveredFamily] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredEmotion, setHoveredEmotion] = useState(null);

  // SVG Virtual Canvas Coordinates
  const SIZE = 800;
  const CENTER = SIZE / 2;

  // Max-scale Progressive Radii
  const INNER_RADIUS = 95;
  
  const isLevel3 = Boolean(selectedFamily && selectedCategory);
  const isLevel2 = Boolean(selectedFamily && !selectedCategory);

  const PRIMARY_OUTER_RADIUS = isLevel3 ? 175 : isLevel2 ? 205 : 365;
  const SECONDARY_INNER_RADIUS = PRIMARY_OUTER_RADIUS;
  const SECONDARY_OUTER_RADIUS = isLevel3 ? 270 : 370;
  const UNSELECTED_CAT_OUTER_RADIUS_L3 = 330; // Extra depth for unselected categories in Level 3
  const TERTIARY_INNER_RADIUS = SECONDARY_OUTER_RADIUS;
  const TERTIARY_OUTER_RADIUS = 375;

  const familiesCount = EMOTION_WHEEL_TAXONOMY.length;

  // Coordinate Conversion Helper
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (((angleInDegrees || 0) - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // SVG Donut Segment Path Builder with gap protection
  const describeArc = (x, y, rInner, rOuter, startAngle, endAngle, gapDegrees = 0.8) => {
    const s = startAngle + gapDegrees;
    const e = endAngle - gapDegrees;

    const startOuter = polarToCartesian(x, y, rOuter, s);
    const endOuter = polarToCartesian(x, y, rOuter, e);
    const startInner = polarToCartesian(x, y, rInner, e);
    const endInner = polarToCartesian(x, y, rInner, s);

    const arcSweep = e - s <= 180 ? '0' : '1';

    return [
      'M', startOuter.x, startOuter.y,
      'A', rOuter, rOuter, 0, arcSweep, 1, endOuter.x, endOuter.y,
      'L', startInner.x, startInner.y,
      'A', rInner, rInner, 0, arcSweep, 0, endInner.x, endInner.y,
      'Z'
    ].join(' ');
  };

  // Optimal Dynamic Readable Angle: Computes natural, comfortable reading orientation for each sector
  // Keeps text strictly within ±35° of horizontal across all 360° quadrants of the wheel.
  const getOptimalReadableRotation = (midAngle) => {
    const norm = (midAngle % 360 + 360) % 360;
    
    // Tangent angle (along the curved arc) flipped to always be right-side up
    const tanAngle = (norm > 90 && norm < 270) ? norm - 180 : (norm >= 270 ? norm - 360 : norm);
    
    // Radial angle (along the spoke from center) flipped to always be right-side up
    const radAngle = (norm >= 180) ? norm - 270 : norm - 90;

    // Pick whichever angle is closest to horizontal (0 degrees), guaranteeing it's within ±35° of horizontal
    return Math.abs(tanAngle) <= Math.abs(radAngle) ? tanAngle : radAngle;
  };

  // Dynamic text-fitting: Guarantees text fits cleanly inside each sector without overflow
  const computeFittedFontSize = (text, arcSpanDegrees, radius, radialDepth, baseSize = 16.0, minSize = 12.0) => {
    const arcLength = radius * (arcSpanDegrees * Math.PI / 180);
    const charCount = Math.max(1, text.length);
    const effectiveSpan = Math.max(arcLength * 0.92, radialDepth * 0.85);
    const availableWidth = Math.max(10, effectiveSpan - 8);
    const maxAllowedSize = availableWidth / (charCount * 0.58);
    return Math.min(baseSize, Math.max(minSize, maxAllowedSize));
  };

  const currentLevel = isLevel3 ? 3 : isLevel2 ? 2 : 1;

  // =========================================================================
  // DYNAMIC ANGULAR ALLOCATION (WIDE EXPLODED BRANCH ENGINE)
  // =========================================================================
  const familyAngularLayout = useMemo(() => {
    if (!selectedFamily) {
      // Level 1: Equal 60-degree sectors
      return EMOTION_WHEEL_TAXONOMY.map((fam, idx) => {
        const span = 360 / familiesCount;
        const startAngle = idx * span;
        const endAngle = startAngle + span;
        const midAngle = startAngle + span / 2;
        return {
          id: fam.id,
          family: fam,
          startAngle,
          endAngle,
          midAngle,
          span
        };
      });
    }

    // Level 2 & 3: Active family expands to 160°, other 5 families compress to 40° each
    const activeIdx = Math.max(0, EMOTION_WHEEL_TAXONOMY.findIndex((f) => f.id === selectedFamily.id));
    const activeSpan = 160;
    const inactiveSpan = (360 - activeSpan) / (familiesCount - 1); // 40° each

    const canonicalMid = activeIdx * (360 / familiesCount) + (360 / familiesCount) / 2;
    const activeStart = canonicalMid - activeSpan / 2;

    const layout = [];
    let currentAngle = activeStart + activeSpan;

    for (let offset = 0; offset < familiesCount; offset++) {
      const idx = (activeIdx + offset) % familiesCount;
      const fam = EMOTION_WHEEL_TAXONOMY[idx];

      if (offset === 0) {
        layout[idx] = {
          id: fam.id,
          family: fam,
          startAngle: activeStart,
          endAngle: activeStart + activeSpan,
          midAngle: canonicalMid,
          span: activeSpan,
          isActive: true
        };
      } else {
        const start = currentAngle;
        const end = start + inactiveSpan;
        const mid = start + inactiveSpan / 2;
        layout[idx] = {
          id: fam.id,
          family: fam,
          startAngle: start,
          endAngle: end,
          midAngle: mid,
          span: inactiveSpan,
          isActive: false
        };
        currentAngle = end;
      }
    }

    return layout;
  }, [selectedFamily, familiesCount]);

  // Active Family Sector Layout
  const activeFamilyLayout = useMemo(() => {
    if (!selectedFamily) return null;
    return familyAngularLayout.find((item) => item.id === selectedFamily.id);
  }, [familyAngularLayout, selectedFamily]);

  // Secondary Categories Angular Layout
  const secondaryCategoriesLayout = useMemo(() => {
    if (!selectedFamily || !activeFamilyLayout) return [];

    const categories = selectedFamily.categories || [];
    const catCount = categories.length;
    if (catCount === 0) return [];

    if (!selectedCategory) {
      // Level 2: Distribute categories evenly across the expansive 160° family arc (40° each!)
      const catSpan = activeFamilyLayout.span / catCount;
      return categories.map((cat, cIdx) => {
        const startAngle = activeFamilyLayout.startAngle + cIdx * catSpan;
        const endAngle = startAngle + catSpan;
        const midAngle = startAngle + catSpan / 2;
        return {
          id: cat.id,
          category: cat,
          startAngle,
          endAngle,
          midAngle,
          span: catSpan,
          isActive: false
        };
      });
    }

    // Level 3: Active category takes 70°, remaining categories share remaining 90° (30° each!)
    const activeCatIdx = Math.max(0, categories.findIndex((c) => c.id === selectedCategory.id));
    const activeCatSpan = Math.min(72, activeFamilyLayout.span * 0.44); // ~70°
    const inactiveCatSpan = (activeFamilyLayout.span - activeCatSpan) / Math.max(1, catCount - 1); // ~30° each

    let currAngle = activeFamilyLayout.startAngle;
    return categories.map((cat, cIdx) => {
      const isSelected = cat.id === selectedCategory.id;
      const span = isSelected ? activeCatSpan : inactiveCatSpan;
      const startAngle = currAngle;
      const endAngle = startAngle + span;
      const midAngle = startAngle + span / 2;
      currAngle = endAngle;

      return {
        id: cat.id,
        category: cat,
        startAngle,
        endAngle,
        midAngle,
        span,
        isActive: isSelected
      };
    });
  }, [selectedFamily, activeFamilyLayout, selectedCategory]);

  // Active Category Sector Layout
  const activeCategoryLayout = useMemo(() => {
    if (!selectedCategory) return null;
    return secondaryCategoriesLayout.find((item) => item.id === selectedCategory.id);
  }, [secondaryCategoriesLayout, selectedCategory]);

  // Tertiary Nuance Emotions Angular Layout
  const tertiaryEmotionsLayout = useMemo(() => {
    if (!selectedFamily || !selectedCategory || !activeCategoryLayout) return [];

    const emotions = selectedCategory.emotions || [];
    const emoCount = emotions.length;
    if (emoCount === 0) return [];

    const emoSpan = activeCategoryLayout.span / emoCount;
    return emotions.map((emo, eIdx) => {
      const startAngle = activeCategoryLayout.startAngle + eIdx * emoSpan;
      const endAngle = startAngle + emoSpan;
      const midAngle = startAngle + emoSpan / 2;
      return {
        id: emo.id,
        emotion: emo,
        startAngle,
        endAngle,
        midAngle,
        span: emoSpan,
        isActive: selectedEmotion?.id === emo.id
      };
    });
  }, [selectedFamily, selectedCategory, activeCategoryLayout, selectedEmotion]);

  // =========================================================================
  // CAMERA FRAMING (FULL-VIEWPORT SCALE & SMOOTH GLIDE)
  // =========================================================================
  const cameraTransform = useMemo(() => {
    if (isDimmedForFlow) {
      return { scale: 0.88, x: 0, y: 0 };
    }

    if (!selectedFamily || !activeFamilyLayout) {
      return { scale: 1.05, x: 0, y: 0 };
    }

    const fMidAngle = activeFamilyLayout.midAngle;

    if (!selectedCategory || !activeCategoryLayout) {
      // Level 2: Camera zooms in prominently to fill the screen with the active family branch
      const scale = 1.35;
      const focusRadius = (PRIMARY_OUTER_RADIUS + SECONDARY_OUTER_RADIUS) / 2;
      const focusPoint = polarToCartesian(CENTER, CENTER, focusRadius, fMidAngle);

      const dx = (CENTER - focusPoint.x) * (scale - 1.02);
      const dy = (CENTER - focusPoint.y) * (scale - 1.02);

      return {
        scale,
        x: Number.isFinite(dx) ? dx : 0,
        y: Number.isFinite(dy) ? dy : 0
      };
    }

    // Level 3: Deep camera zoom bringing the active category & tertiary ring to the front
    const scale = 1.50;
    const focusRadius = (SECONDARY_INNER_RADIUS + TERTIARY_OUTER_RADIUS) / 2;
    const focusPoint = polarToCartesian(CENTER, CENTER, focusRadius, activeCategoryLayout.midAngle);

    const dx = (CENTER - focusPoint.x) * (scale - 0.98);
    const dy = (CENTER - focusPoint.y) * (scale - 0.98);

    return {
      scale,
      x: Number.isFinite(dx) ? dx : 0,
      y: Number.isFinite(dy) ? dy : 0
    };
  }, [selectedFamily, selectedCategory, activeFamilyLayout, activeCategoryLayout, isDimmedForFlow, PRIMARY_OUTER_RADIUS, SECONDARY_INNER_RADIUS, SECONDARY_OUTER_RADIUS, TERTIARY_OUTER_RADIUS]);

  return (
    <div
      className="radial-camera-emotion-wheel-container"
      style={{
        width: '100%',
        maxWidth: '740px',
        aspectRatio: '1 / 1',
        position: 'relative',
        borderRadius: '28px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)',
        border: `1.5px solid ${selectedFamily ? `${selectedFamily.color}45` : 'rgba(255, 255, 255, 0.12)'}`,
        boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.7), inset 0 0 40px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        userSelect: 'none',
        opacity: isDimmedForFlow ? 0.35 : 1,
        transition: 'border-color 0.5s ease, opacity 0.5s ease'
      }}
    >
      {/* Animated Moving Camera Stage */}
      <motion.div
        animate={{
          scale: cameraTransform.scale,
          x: cameraTransform.x,
          y: cameraTransform.y
        }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 22,
          mass: 0.85
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformOrigin: '50% 50%'
        }}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
          role="img"
          aria-label="Recomputed Focused Radial Emotion Wheel"
        >
          <defs>
            <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Base Outer Guide Circle */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={isLevel3 ? TERTIARY_OUTER_RADIUS : isLevel2 ? SECONDARY_OUTER_RADIUS : PRIMARY_OUTER_RADIUS}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
            style={{ transition: 'r 0.4s ease' }}
          />

          {/* =================================================================== */}
          {/* LAYER 1: 6 PRIMARY EMOTION FAMILIES (DYNAMIC ANGULAR ALLOCATION) */}
          {/* =================================================================== */}
          {familyAngularLayout.map((item) => {
            const family = item.family;
            const isSelected = selectedFamily?.id === family.id;
            const isHovered = hoveredFamily?.id === family.id;
            const isDimmed = selectedFamily && !isSelected;

            const midRadius = (INNER_RADIUS + PRIMARY_OUTER_RADIUS) / 2;
            const textPos = polarToCartesian(CENTER, CENTER, midRadius, item.midAngle);
            const opacity = isSelected ? 1 : isHovered ? 0.95 : isDimmed ? 0.22 : 0.88;

            const baseSize = currentLevel === 1 ? 23 : isSelected ? 18 : 13.5;
            const radialDepth = PRIMARY_OUTER_RADIUS - INNER_RADIUS;
            const fittedSize = computeFittedFontSize(family.name, item.span, midRadius, radialDepth, baseSize, 12);

            return (
              <g
                key={family.id}
                className="radial-family-arc"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (isSelected && !selectedCategory) {
                    onSelectFamily(null);
                  } else {
                    onSelectFamily(family);
                  }
                }}
                onMouseEnter={() => setHoveredFamily(family)}
                onMouseLeave={() => setHoveredFamily(null)}
              >
                <path
                  d={describeArc(CENTER, CENTER, INNER_RADIUS, PRIMARY_OUTER_RADIUS, item.startAngle, item.endAngle, 0.8)}
                  fill={family.color}
                  fillOpacity={opacity}
                  stroke={isSelected ? '#ffffff' : isHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 0.25)'}
                  strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1}
                  style={{
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    filter: isSelected ? 'url(#activeGlow)' : 'none'
                  }}
                />

                {/* Razor-Sharp Bold Primary Family Label */}
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  stroke="rgba(0, 0, 0, 0.85)"
                  strokeWidth="2.5px"
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  fontSize={`${fittedSize.toFixed(1)}px`}
                  fontWeight="900"
                  letterSpacing="0.08em"
                  transform={`rotate(${getOptimalReadableRotation(item.midAngle)}, ${textPos.x}, ${textPos.y})`}
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                    textTransform: 'uppercase',
                    opacity: isDimmed ? 0.35 : 1,
                    transition: 'all 0.35s ease',
                    textRendering: 'geometricPrecision'
                  }}
                >
                  {family.name}
                </text>
              </g>
            );
          })}

          {/* =================================================================== */}
          {/* LAYER 2: EXPANDED SECONDARY EMOTION CATEGORIES (DYNAMIC READABLE ANGLES) */}
          {/* =================================================================== */}
          {selectedFamily && secondaryCategoriesLayout.length > 0 && (
            <g className="revealed-secondary-ring">
              {secondaryCategoriesLayout.map((item) => {
                const category = item.category;
                const isCatSelected = selectedCategory?.id === category.id;
                const isCatHovered = hoveredCategory?.id === category.id;
                const isCatDimmed = selectedCategory && !isCatSelected;

                const outerRadius = isLevel3
                  ? isCatSelected
                    ? SECONDARY_OUTER_RADIUS
                    : UNSELECTED_CAT_OUTER_RADIUS_L3
                  : SECONDARY_OUTER_RADIUS;

                const radialDepth = outerRadius - SECONDARY_INNER_RADIUS;
                const midRadius = (SECONDARY_INNER_RADIUS + outerRadius) / 2;
                const textPos = polarToCartesian(CENTER, CENTER, midRadius, item.midAngle);
                const fillOpacity = isCatSelected ? 1 : isCatHovered ? 0.95 : isCatDimmed ? 0.38 : 0.88;
                const textRotation = getOptimalReadableRotation(item.midAngle);

                const baseCatSize = isCatSelected ? 18 : 15.5;
                const fittedCatSize = computeFittedFontSize(category.name, item.span, midRadius, radialDepth, baseCatSize, 12.5);

                return (
                  <g
                    key={category.id}
                    className="radial-category-arc"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (isCatSelected && !selectedEmotion) {
                        onSelectCategory(null);
                      } else {
                        onSelectCategory(category);
                      }
                    }}
                    onMouseEnter={() => setHoveredCategory(category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <path
                      d={describeArc(CENTER, CENTER, SECONDARY_INNER_RADIUS, outerRadius, item.startAngle, item.endAngle, 0.6)}
                      fill={selectedFamily.secondaryColor || selectedFamily.color}
                      fillOpacity={fillOpacity}
                      stroke={isCatSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.55)'}
                      strokeWidth={isCatSelected ? 3.5 : 1.5}
                      style={{
                        transition: 'all 0.35s ease',
                        filter: isCatSelected ? 'url(#activeGlow)' : 'none'
                      }}
                    />

                    {/* Naturally Readable Category Label */}
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      stroke="rgba(0, 0, 0, 0.85)"
                      strokeWidth="2.5px"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
                      fontSize={`${fittedCatSize.toFixed(1)}px`}
                      fontWeight={isCatSelected ? '900' : '800'}
                      transform={`rotate(${textRotation}, ${textPos.x}, ${textPos.y})`}
                      style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                        opacity: isCatDimmed ? 0.6 : 1,
                        transition: 'opacity 0.25s ease',
                        textRendering: 'geometricPrecision'
                      }}
                    >
                      {category.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* =================================================================== */}
          {/* LAYER 3: EXPANDED TERTIARY GRANULAR EMOTIONS (DYNAMIC READABLE ANGLES) */}
          {/* =================================================================== */}
          {selectedFamily && selectedCategory && tertiaryEmotionsLayout.length > 0 && (
            <g className="revealed-tertiary-ring">
              {tertiaryEmotionsLayout.map((item) => {
                const emotion = item.emotion;
                const isEmoSelected = selectedEmotion?.id === emotion.id;
                const isEmoHovered = hoveredEmotion?.id === emotion.id;
                const isEmoDimmed = selectedEmotion && !isEmoSelected;

                const radialDepth = TERTIARY_OUTER_RADIUS - TERTIARY_INNER_RADIUS;
                const midRadius = (TERTIARY_INNER_RADIUS + TERTIARY_OUTER_RADIUS) / 2;
                const textPos = polarToCartesian(CENTER, CENTER, midRadius, item.midAngle);
                const fillOpacity = isEmoSelected ? 1 : isEmoHovered ? 0.95 : isEmoDimmed ? 0.25 : 0.88;
                const textRotation = getOptimalReadableRotation(item.midAngle);

                const baseEmoSize = isEmoSelected ? 17 : 15.5;
                const fittedEmoSize = computeFittedFontSize(emotion.name, item.span, midRadius, radialDepth, baseEmoSize, 12.5);

                return (
                  <g
                    key={emotion.id}
                    className="radial-emotion-arc"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectEmotion(emotion)}
                    onMouseEnter={() => setHoveredEmotion(emotion)}
                    onMouseLeave={() => setHoveredEmotion(null)}
                  >
                    <path
                      d={describeArc(CENTER, CENTER, TERTIARY_INNER_RADIUS, TERTIARY_OUTER_RADIUS, item.startAngle, item.endAngle, 0.5)}
                      fill={selectedFamily.accent || selectedFamily.color}
                      fillOpacity={fillOpacity}
                      stroke={isEmoSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)'}
                      strokeWidth={isEmoSelected ? 3.5 : 1.5}
                      style={{
                        transition: 'all 0.25s ease',
                        filter: isEmoSelected ? 'url(#activeGlow)' : 'none'
                      }}
                    />

                    {/* Naturally Readable Granular Emotion Label */}
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      stroke="rgba(0, 0, 0, 0.85)"
                      strokeWidth="2.5px"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
                      fontSize={`${fittedEmoSize.toFixed(1)}px`}
                      fontWeight={isEmoSelected ? '900' : '800'}
                      transform={`rotate(${textRotation}, ${textPos.x}, ${textPos.y})`}
                      style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                        opacity: isEmoDimmed ? 0.35 : 1,
                        transition: 'opacity 0.25s ease',
                        textRendering: 'geometricPrecision'
                      }}
                    >
                      {emotion.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* =================================================================== */}
          {/* CENTER CORE: ORIENTATION ANCHOR (ALWAYS VISIBLE & NON-CLICKABLE) */}
          {/* =================================================================== */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={INNER_RADIUS - 6}
            fill="#0a0f1d"
            stroke={selectedFamily ? selectedFamily.color : 'rgba(255, 255, 255, 0.35)'}
            strokeWidth={selectedFamily ? '3.5' : '2'}
            style={{
              cursor: 'default',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.8))',
              transition: 'all 0.35s ease'
            }}
          />

          <text
            x={CENTER}
            y={CENTER - 8}
            textAnchor="middle"
            fill={selectedFamily ? selectedFamily.color : '#ffffff'}
            fontSize={selectedFamily ? '15px' : '13px'}
            fontWeight="900"
            letterSpacing="0.08em"
            style={{ pointerEvents: 'none', userSelect: 'none', textTransform: 'uppercase', textRendering: 'geometricPrecision' }}
          >
            {selectedEmotion
              ? selectedEmotion.name
              : selectedCategory
              ? selectedCategory.name
              : selectedFamily
              ? selectedFamily.name
              : 'FEELINGS'}
          </text>

          <text
            x={CENTER}
            y={CENTER + 12}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.7)"
            fontSize="10.5px"
            fontWeight="600"
            style={{ pointerEvents: 'none', userSelect: 'none', textTransform: 'uppercase', textRendering: 'geometricPrecision' }}
          >
            {selectedEmotion
              ? 'Selected'
              : selectedCategory
              ? 'Select nuance'
              : selectedFamily
              ? 'Explore deeper'
              : 'Tap a family'}
          </text>
        </svg>
      </motion.div>
    </div>
  );
}
