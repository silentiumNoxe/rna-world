// Global variable to track the presence of signaling substance S
let isLigandPresent = false;

// Variable to track if RNA is in activated state
let isRNAActivated = false;

// Variables for RNA pulsing animation
let pulseAnimationId = null;
let pulseScale = 1.0;
let pulseDirection = 1;

// Initialize the canvas and context
const canvas = document.getElementById('rna-canvas');
const ctx = canvas.getContext('2d');

// Nucleotide types
const nucleotideTypes = ['A', 'U', 'G', 'C'];

// Complementary pairs in RNA
const complementaryPairs = {
  'A': 'U',
  'U': 'A',
  'G': 'C',
  'C': 'G'
};

// RNA chain data structure
let rnaChain = [];

// Variable to store the selected nucleotide
let selectedNucleotide = null;

// Array to store complementary nucleotides to the selected one
let complementaryNucleotides = [];

// Array to store hydrogen bonds between nucleotides
let hydrogenBonds = [];

// Track the regulatory loop (rich in A nucleotides)
let regulatoryLoop = null;

// DOM elements for RNA properties
let rnaStabilityElement;
let rnaLengthElement;
let rnaFunctionElement;

// RNA properties values
let rnaStability = 0;
let rnaActiveFunction = 'None';
let rnaChemicalAffinities = [];

// Set canvas dimensions to match its container
function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;

  // Redraw everything when canvas is resized
  if (rnaChain.length > 0) {
    drawRNAChain();
    renderRNASequence();
  }
}

// Call resize on load and when window is resized
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Generate a random RNA chain
function generateRNAChain() {
  rnaChain = [];
  const chainLength = 20; // Longer chain for better scrolling demonstration
  const radius = 25;

  // Calculate starting position (centered horizontally, upper part vertically)
  const startX = canvas.width / 2 - (chainLength * radius * 1.5) / 2;
  const y = canvas.height / 3;

  for (let i = 0; i < chainLength; i++) {
    // Create nucleotide with random type
    const randomType = nucleotideTypes[Math.floor(Math.random() * nucleotideTypes.length)];
    rnaChain.push({
      x: startX + i * radius * 3,  // Space nucleotides evenly
      y: y,
      type: randomType,
      radius: radius
    });
  }
}

// Draw a single nucleotide
function drawNucleotide(nucleotide) {
  // Draw the circle
  ctx.beginPath();
  ctx.arc(nucleotide.x, nucleotide.y, nucleotide.radius, 0, Math.PI * 2);

  // Check if this nucleotide is part of the regulatory loop and RNA is activated
  const isPartOfActivatedRegulator = isRNAActivated && 
                                     regulatoryLoop && 
                                     regulatoryLoop.nucleotides && 
                                     regulatoryLoop.nucleotides.includes(nucleotide);

  // Different colors for different nucleotide types
  if (isPartOfActivatedRegulator) {
    // Bright yellow for activated regulatory loop nucleotides
    ctx.fillStyle = '#FFDD00';
  } else {
    switch(nucleotide.type) {
      case 'A':
        ctx.fillStyle = '#FF6B6B'; // Red
        break;
      case 'U':
        ctx.fillStyle = '#4ECDC4'; // Teal
        break;
      case 'G':
        ctx.fillStyle = '#FFE66D'; // Yellow
        break;
      case 'C':
        ctx.fillStyle = '#6B5B95'; // Purple
        break;
    }
  }

  ctx.fill();

  // First draw regular border
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;

  // Check if this nucleotide is selected and highlight it
  if (selectedNucleotide === nucleotide) {
    ctx.strokeStyle = '#FF9900'; // Orange highlight for selected nucleotide
    ctx.lineWidth = 4;

    // Draw a glowing effect
    ctx.shadowColor = '#FF9900';
    ctx.shadowBlur = 10;
  } 
  // Check if this is a complementary nucleotide and highlight it
  else if (complementaryNucleotides.includes(nucleotide)) {
    ctx.strokeStyle = '#4CAF50'; // Green highlight for complementary nucleotides
    ctx.lineWidth = 3;

    // Draw a different glowing effect
    ctx.shadowColor = '#4CAF50';
    ctx.shadowBlur = 8;
  }

  ctx.stroke();

  // Reset shadow effect
  ctx.shadowBlur = 0;

    // Check if this nucleotide is part of a loop with chemical affinity
    let isInSubstanceLoop = false;
    let substanceType = null;

    for (const bond of hydrogenBonds) {
      if (bond.loopNucleotides && bond.loopNucleotides.includes(nucleotide)) {
        if (bond.chemicalAffinity === 'Substance P') {
          isInSubstanceLoop = true;
          substanceType = 'P';
          break;
        } else if (bond.chemicalAffinity === 'Substance R') {
          isInSubstanceLoop = true;
          substanceType = 'R';
          break;
        }
      }
    }

    // Draw special indicator for nucleotides in active loops
    if (isInSubstanceLoop) {
      const glowColor = substanceType === 'P' ? '#9b59b6' : '#16a085';

      // Add glow effect around the nucleotide
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(nucleotide.x, nucleotide.y, nucleotide.radius + 5, 0, Math.PI * 2);
      ctx.stroke();

      // Add semi-transparent glow around the nucleotide
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.arc(nucleotide.x, nucleotide.y, nucleotide.radius + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Draw a small indicator of the substance type
      ctx.fillStyle = glowColor;
      ctx.font = 'bold 10px Arial';
      ctx.fillText(substanceType, nucleotide.x + nucleotide.radius - 6, 
                  nucleotide.y - nucleotide.radius + 6);
    }

  // Draw the nucleotide letter
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(nucleotide.type, nucleotide.x, nucleotide.y);
}

// Draw lines connecting nucleotides
function drawConnections() {
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  // Ensure solid line for backbone connections
  ctx.setLineDash([]);

  for (let i = 0; i < rnaChain.length - 1; i++) {
    const current = rnaChain[i];
    const next = rnaChain[i + 1];

    ctx.beginPath();
    ctx.moveTo(current.x + current.radius, current.y);
    ctx.lineTo(next.x - next.radius, next.y);
    ctx.stroke();
  }
}

// Check if RNA should be activated based on ligand presence
function checkRNAActivation() {
  if (regulatoryLoop && regulatoryLoop.bond) {
    if (isLigandPresent && !isRNAActivated) {
      // Activate the RNA
      activateRNA();
    } else if (!isLigandPresent && isRNAActivated) {
      // Deactivate the RNA
      deactivateRNA();
    }
  }
}

// Activate the RNA (start pulsing and change regulatory loop color)
function activateRNA() {
  isRNAActivated = true;
  console.log('RNA activated due to substance S presence');

  // Start the pulsing animation if not already running
  if (!pulseAnimationId) {
    startPulseAnimation();
  }

  // Redraw to show the activated state
  drawRNAChain();
}

// Deactivate the RNA
function deactivateRNA() {
  isRNAActivated = false;
  console.log('RNA deactivated, substance S not present');

  // Stop the pulsing animation
  if (pulseAnimationId) {
    cancelAnimationFrame(pulseAnimationId);
    pulseAnimationId = null;
    pulseScale = 1.0; // Reset scale
  }

  // Redraw to show normal state
  drawRNAChain();
}

// Start the pulsing animation
function startPulseAnimation() {
  const pulseMagnitude = 0.02; // How much to pulse (2% size change)
  const pulseSpeed = 0.001;    // Speed of pulsing

  function animate() {
    // Update the pulse scale
    pulseScale += pulseDirection * pulseSpeed;

    // Reverse direction if at the extremes
    if (pulseScale > 1.0 + pulseMagnitude) {
      pulseDirection = -1;
    } else if (pulseScale < 1.0 - pulseMagnitude) {
      pulseDirection = 1;
    }

    // Redraw the RNA chain with the current scale
    drawRNAChain();

    // Continue animation
    pulseAnimationId = requestAnimationFrame(animate);
  }

  // Start the animation loop
  pulseAnimationId = requestAnimationFrame(animate);
}

// Draw the RNA sequence in the sequence viewer
function renderRNASequence() {
  const sequenceContainer = document.getElementById('rna-sequence');
  sequenceContainer.innerHTML = '';

  // Clear existing sequence
  while (sequenceContainer.firstChild) {
    sequenceContainer.removeChild(sequenceContainer.firstChild);
  }

  // Create a visual representation of each nucleotide in the sequence
  rnaChain.forEach((nucleotide, index) => {
    const nucleotideElement = document.createElement('div');
    nucleotideElement.className = 'sequence-nucleotide';
    nucleotideElement.dataset.index = index;

    // Set color based on nucleotide type
    let bgColor;
    switch(nucleotide.type) {
      case 'A': bgColor = '#FF6B6B'; break; // Red
      case 'U': bgColor = '#4ECDC4'; break; // Teal
      case 'G': bgColor = '#FFE66D'; break; // Yellow
      case 'C': bgColor = '#6B5B95'; break; // Purple
    }

    nucleotideElement.style.backgroundColor = bgColor;
    nucleotideElement.textContent = nucleotide.type;

    // Check if this nucleotide has hydrogen bond
    let hasBond = false;
    for (const bond of hydrogenBonds) {
      if (bond.from === nucleotide || bond.to === nucleotide) {
        hasBond = true;
        nucleotideElement.classList.add('has-bond');
        break;
      }
    }

    // Add event listener for selection
    nucleotideElement.addEventListener('click', function(event) {
      // If holding shift key, cycle through nucleotide types
      if (event.shiftKey) {
        cycleNucleotideType(index);
      } else {
        // Handle nucleotide selection in sequence view
        handleSequenceNucleotideClick(index);
      }
    });

    // Add double-click for cycling nucleotide type without shift key
    nucleotideElement.addEventListener('dblclick', function() {
      cycleNucleotideType(index);
    });

    sequenceContainer.appendChild(nucleotideElement);
  });

  // Add explanation hint
  const hint = document.createElement('div');
  hint.className = 'sequence-hint';
  hint.textContent = 'Double-click to change nucleotide type';
  sequenceContainer.appendChild(hint);
}

// Handle click on sequence nucleotide
function handleSequenceNucleotideClick(index) {
  const nucleotide = rnaChain[index];

  // Find and remove all current selection classes
  const allNucleotides = document.querySelectorAll('.sequence-nucleotide');
  allNucleotides.forEach(el => {
    el.classList.remove('selected');
    el.classList.remove('complementary');
  });

  if (selectedNucleotide === nucleotide) {
    // Deselect if already selected
    selectedNucleotide = null;
    complementaryNucleotides = [];
  } else {
    // Select this nucleotide
    selectedNucleotide = nucleotide;
    findComplementaryNucleotides();

    // Apply visual selection to the clicked element
    const selectedElement = document.querySelector(`.sequence-nucleotide[data-index="${index}"]`);
    if (selectedElement) selectedElement.classList.add('selected');

    // Apply complementary class to all complementary nucleotides
    complementaryNucleotides.forEach(compNucleotide => {
      const compIndex = rnaChain.indexOf(compNucleotide);
      const compElement = document.querySelector(`.sequence-nucleotide[data-index="${compIndex}"]`);
      if (compElement) compElement.classList.add('complementary');
    });
  }

  // Update visualizations
  drawRNAChain();
}

// Draw the entire RNA chain
function drawRNAChain() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply pulsing effect if RNA is activated
  if (isRNAActivated) {
    ctx.save();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(pulseScale, pulseScale);
    ctx.translate(-centerX, -centerY);
  }

  // Draw connections first (so they appear behind nucleotides)
  drawConnections();

  // Draw hydrogen bonds
  drawHydrogenBonds();

  // Draw each nucleotide
  rnaChain.forEach(nucleotide => {
    drawNucleotide(nucleotide);
  });

  // Restore the canvas state if transformed
  if (isRNAActivated) {
    ctx.restore();
  }

  // Also update the sequence viewer
  renderRNASequence();
}

// Draw hydrogen bonds between nucleotides
function drawHydrogenBonds() {
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]); // Dashed line for hydrogen bonds

  // First check if we have a dumbbell structure
  const dumbbellStructure = detectDumbbellStructure();
  const isPartOfStemBond = new Set(); // Set to track bonds in the stem

  // If we have a dumbbell structure, identify the stem bonds for special styling
  if (dumbbellStructure) {
    // Find the stem bonds
    for (let i = 0; i < hydrogenBonds.length; i++) {
      const bond = hydrogenBonds[i];
      const fromIndex = rnaChain.indexOf(bond.from);
      const toIndex = rnaChain.indexOf(bond.to);

      // Check if this bond forms part of a stem connecting two loops
      if (bond.chemicalAffinity === 'None' || !bond.loopNucleotides) {
        // This might be a stem bond - check position
        for (let j = 0; j < hydrogenBonds.length; j++) {
          if (i !== j && hydrogenBonds[j].chemicalAffinity && hydrogenBonds[j].chemicalAffinity !== 'None') {
            const loopStartIndex = rnaChain.indexOf(hydrogenBonds[j].from);
            const loopEndIndex = rnaChain.indexOf(hydrogenBonds[j].to);

            // If this bond connects two functional loops
            if ((fromIndex < loopStartIndex && toIndex > loopEndIndex) ||
                (toIndex < loopStartIndex && fromIndex > loopEndIndex)) {
                isPartOfStemBond.add(i);
            }
          }
        }
      }
    }
  }

  hydrogenBonds.forEach((bond, index) => {
    // Check if this bond is part of a stem in a dumbbell structure
    const isStemBond = isPartOfStemBond.has(index);

    // Check if this bond is the regulatory loop bond and RNA is activated
    const isRegulatorBond = isRNAActivated && regulatoryLoop && bond === regulatoryLoop.bond;

    // Check if this bond is part of a loop with chemical affinity
    let hasChemicalAffinity = bond.chemicalAffinity && bond.chemicalAffinity !== 'None';

    // Different colors for different bond types
    if (isRegulatorBond) {
      // Special styling for activated regulatory loop bonds
      ctx.strokeStyle = '#FFDD00'; // Bright yellow
      ctx.lineWidth = 3;
      ctx.setLineDash([2, 2]); // Different dash pattern
      ctx.shadowColor = '#FFDD00';
      ctx.shadowBlur = 12;
    } else if (isStemBond && dumbbellStructure) {
      // Special styling for stem bonds in dumbbell structures
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 4;
      ctx.setLineDash([2, 2]); // Different dash pattern
      ctx.shadowColor = 'gold';
      ctx.shadowBlur = 15;
    } else if (hasChemicalAffinity) {
      // Set color based on chemical affinity
      if (bond.chemicalAffinity === 'Substance P') {
        ctx.strokeStyle = '#9b59b6'; // Purple for Substance P
      } else if (bond.chemicalAffinity === 'Substance R') {
        ctx.strokeStyle = '#16a085'; // Green for Substance R
      }
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 3]); // Reset dash pattern

      // Add glow effect to bonds in active loops
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
    } else {
      // Regular bond styling
      if (bond.type === 'AU') {
        ctx.strokeStyle = '#8e44ad'; // Purple color for A-U bonds
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#2980b9'; // Blue color for G-C bonds
        ctx.lineWidth = 3; // Thicker lines for G-C bonds to indicate stronger connection
      }
      ctx.setLineDash([5, 3]); // Reset dash pattern
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();
    ctx.moveTo(bond.from.x, bond.from.y);
    ctx.lineTo(bond.to.x, bond.to.y);
    ctx.stroke();

    // Reset shadow blur after drawing
    ctx.shadowBlur = 0;
  });

  // Reset line dash and width
  ctx.setLineDash([]);
  ctx.lineWidth = 2;
}
// Function to cycle through nucleotide types (A -> U -> G -> C -> A)  
function cycleNucleotideType(index) {
  // Get the current nucleotide
  const nucleotide = rnaChain[index];

  // Check if this nucleotide has a bond - can't change bonded nucleotides
  for (const bond of hydrogenBonds) {
    if (bond.from === nucleotide || bond.to === nucleotide) {
      console.log('Cannot change nucleotide type: it has a hydrogen bond');
      // Show visual feedback that it can't be changed
      const element = document.querySelector(`.sequence-nucleotide[data-index="${index}"]`);
      element.classList.add('has-bond');
      setTimeout(() => element.classList.remove('has-bond'), 300);
      return; // Cannot change type if it has a bond
    }
  }

  // Add animation effect to the nucleotide element
  const element = document.querySelector(`.sequence-nucleotide[data-index="${index}"]`);
  element.classList.add('changing');

  // Cycle to the next type
  const currentTypeIndex = nucleotideTypes.indexOf(nucleotide.type);
  const nextTypeIndex = (currentTypeIndex + 1) % nucleotideTypes.length;
  nucleotide.type = nucleotideTypes[nextTypeIndex];

  // If this nucleotide was selected, clear selection and complementary nucleotides
  if (selectedNucleotide === nucleotide) {
    selectedNucleotide = null;
    complementaryNucleotides = [];
  }

  // If there were any complementary nucleotides selected, reset those too
  if (selectedNucleotide) {
    findComplementaryNucleotides(); // Recalculate based on the new type
  }

  // Update the RNA properties since we've changed a nucleotide
  updateRNAProperties();
  updateActiveFunctions();

  // Update visualizations
  renderRNASequence();
  drawRNAChain();

  // Remove animation class after a delay
  setTimeout(() => {
    const updatedElement = document.querySelector(`.sequence-nucleotide[data-index="${index}"]`);
    if (updatedElement) updatedElement.classList.remove('changing');
  }, 300);

  console.log(`Changed nucleotide ${index} to type ${nucleotide.type}`);
}
// Function to analyze the chemical affinity of a loop based on nucleotide composition
function analyzeLoopChemicalAffinity(loopNucleotides) {
  if (loopNucleotides.length === 0) {
    return 'None';
  }

  // Count the different types of nucleotides in the loop
  let countC = 0;
  let countU = 0;
  let countG = 0;
  let countA = 0;

  loopNucleotides.forEach(nucleotide => {
    switch (nucleotide.type) {
      case 'C': countC++; break;
      case 'U': countU++; break;
      case 'G': countG++; break;
      case 'A': countA++; break;
    }
  });

  // Calculate percentages
  const totalNucleotides = loopNucleotides.length;
  const percentCU = ((countC + countU) / totalNucleotides) * 100;
  const percentGA = ((countG + countA) / totalNucleotides) * 100;
  const percentA = (countA / totalNucleotides) * 100;

  // Check if this is a regulatory loop (>50% adenine)
  if (percentA > 50 && !regulatoryLoop) {
    // Store this as our regulatory loop
    regulatoryLoop = {
      nucleotides: loopNucleotides,
      bond: null // Will be set by the calling function
    };
    console.log('Regulatory loop detected!');
  }

  // Determine chemical affinity based on nucleotide composition
  let affinity = 'None';
  if (percentCU > 50) {
    affinity = 'Substance P'; // More than 50% C and U
  } else if (percentGA > 50) {
    affinity = 'Substance R'; // More than 50% G and A
  }

  // Immediately update visual representation for the new function
  if (affinity !== 'None') {
    drawRNAChain(); // Refresh the visual representation to show the new active loop
  }

  return affinity;
}

// Animation variables
let animationInProgress = false;
let animationStartTime = 0;
const animationDuration = 1000; // 1 second animation

// Animate the RNA chain folding
function animateFolding() {
  // Don't start another animation if one is already in progress
  if (animationInProgress) {
    return;
  }

  animationInProgress = true;
  animationStartTime = performance.now();

  // Start the animation loop
  requestAnimationFrame(animationFrame);
}

// Animation frame for RNA folding
function animationFrame(timestamp) {
  // Calculate progress (0 to 1)
  const elapsed = timestamp - animationStartTime;
  let progress = Math.min(elapsed / animationDuration, 1);

  // Apply easing for smoother animation (ease in-out)
  progress = progress < 0.5 
    ? 2 * progress * progress 
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  // Update positions of all nucleotides that have target positions
  let animationComplete = true;

  rnaChain.forEach(nucleotide => {
    if (nucleotide.hasOwnProperty('targetX') && nucleotide.hasOwnProperty('targetY')) {
      // Interpolate between original and target positions
      nucleotide.x = nucleotide.originalX + (nucleotide.targetX - nucleotide.originalX) * progress;
      nucleotide.y = nucleotide.originalY + (nucleotide.targetY - nucleotide.originalY) * progress;

      // Check if animation is still needed
      if (progress < 1) {
        animationComplete = false;
      }
    }
  });

  // Redraw the RNA chain
  drawRNAChain();

  // Continue animation if not complete
  if (!animationComplete) {
    requestAnimationFrame(animationFrame);
  } else {
    // Animation is complete - update final positions
    rnaChain.forEach(nucleotide => {
      if (nucleotide.hasOwnProperty('targetX') && nucleotide.hasOwnProperty('targetY')) {
        nucleotide.x = nucleotide.targetX;
        nucleotide.y = nucleotide.targetY;
      }
    });

    // Reset animation state
    animationInProgress = false;

    // Update RNA properties and perform function analysis after folding completes
    updateRNAProperties();
    updateActiveFunctions();
  }
}

// Check if a point is inside a nucleotide
function isPointInNucleotide(x, y, nucleotide) {
  const distance = Math.sqrt(
    Math.pow(x - nucleotide.x, 2) + Math.pow(y - nucleotide.y, 2)
  );
  return distance <= nucleotide.radius;
}

// Handle canvas click event
function handleCanvasClick(event) {
  // Get click coordinates relative to the canvas
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Check if click is on any nucleotide
  let clickedOnNucleotide = false;
  let clickedNucleotide = null;

  for (let i = 0; i < rnaChain.length; i++) {
    if (isPointInNucleotide(x, y, rnaChain[i])) {
      clickedNucleotide = rnaChain[i];
      clickedOnNucleotide = true;
      break;
    }
  }

  // If we have a selected nucleotide and clicked on a complementary one
  if (selectedNucleotide && clickedOnNucleotide && 
      complementaryNucleotides.includes(clickedNucleotide)) {

    // Create a hydrogen bond between the two nucleotides
    createHydrogenBond(selectedNucleotide, clickedNucleotide);

    // Clear selection
    selectedNucleotide = null;
    complementaryNucleotides = [];
  } 
  // If clicked on a new nucleotide (or the same one to deselect)
  else if (clickedOnNucleotide) {
    // If we already selected this nucleotide, deselect it
    if (selectedNucleotide === clickedNucleotide) {
      selectedNucleotide = null;
      complementaryNucleotides = [];
    } else {
      selectedNucleotide = clickedNucleotide;
      // Find all complementary nucleotides
      findComplementaryNucleotides();
    }
  }
  // If clicked outside of any nucleotide, deselect
  else {
    selectedNucleotide = null;
    complementaryNucleotides = [];
  }

  // Redraw the RNA chain to show the selection and bonds
  drawRNAChain();
}

// Create a hydrogen bond between two nucleotides
function createHydrogenBond(nucleotide1, nucleotide2) {
  // Check if this bond already exists
  for (const bond of hydrogenBonds) {
    if ((bond.from === nucleotide1 && bond.to === nucleotide2) ||
        (bond.from === nucleotide2 && bond.to === nucleotide1)) {
      return; // Bond already exists
    }

    // Check if either nucleotide already has a bond (one-to-one rule)
    if (bond.from === nucleotide1 || bond.to === nucleotide1 || 
        bond.from === nucleotide2 || bond.to === nucleotide2) {
      console.log('Cannot create bond: One or both nucleotides already have a bond');
      return; // One of the nucleotides already has a bond
    }
  }

  // Determine bond type (A-U or G-C)
  const bondType = (nucleotide1.type === 'A' && nucleotide2.type === 'U') || 
                  (nucleotide1.type === 'U' && nucleotide2.type === 'A') ? 'AU' : 'GC';

  // Add the new bond with bond type information
  const newBond = {
    from: nucleotide1,
    to: nucleotide2,
    type: bondType
  };

  hydrogenBonds.push(newBond);

  // After creating the bond, calculate new positions and animate the folding
  calculateFoldingPositions(newBond);

  // If we just identified a regulatory loop in calculateFoldingPositions,
  // store the bond reference in the regulatory loop object
  if (regulatoryLoop && !regulatoryLoop.bond) {
    // Check if this bond forms the regulatory loop
    const fromIndex = rnaChain.indexOf(newBond.from);
    const toIndex = rnaChain.indexOf(newBond.to);
    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);
    const loopNucleotides = rnaChain.slice(startIndex + 1, endIndex);

    if (loopNucleotides.every(n => regulatoryLoop.nucleotides.includes(n))) {
      regulatoryLoop.bond = newBond;
      console.log('Regulatory loop bond established');

      // Check if ligand is present and update activation state
      checkRNAActivation();
    }
  }

  // Update RNA properties in the UI
  updateRNAProperties();

  // For immediate bonds without animation (e.g., if loop is too small)
  if (!animationInProgress) {
    updateActiveFunctions();
  }
}

// Calculate new positions for nucleotides to form a loop after creating a bond
function calculateFoldingPositions(bond) {
  // Find indices of the bonded nucleotides in the chain
  const fromIndex = rnaChain.indexOf(bond.from);
  const toIndex = rnaChain.indexOf(bond.to);

  // Determine which index is smaller/larger
  const startIndex = Math.min(fromIndex, toIndex);
  const endIndex = Math.max(fromIndex, toIndex);

  // If they're adjacent or there are no nucleotides between them, no folding needed
  if (endIndex - startIndex <= 1) {
    return;
  }

  // Store the loop nucleotides for chemical affinity analysis
  const loopNucleotides = rnaChain.slice(startIndex + 1, endIndex);
  bond.loopNucleotides = loopNucleotides;

  // Analyze loop for chemical affinity
  bond.chemicalAffinity = analyzeLoopChemicalAffinity(loopNucleotides);

  // Store original positions for animation
  rnaChain.forEach(nucleotide => {
    nucleotide.originalX = nucleotide.x;
    nucleotide.originalY = nucleotide.y;
  });

  // Calculate the number of nucleotides in the loop
  const loopSize = endIndex - startIndex - 1;

  // Center point of the arc (midpoint between bonded nucleotides)
  const centerX = (bond.from.x + bond.to.x) / 2;
  const centerY = (bond.from.y + bond.to.y) / 2 + 80; // Offset downward to form the loop

  // Calculate radius of the arc based on the distance between nucleotides
  const distance = Math.sqrt(
    Math.pow(bond.to.x - bond.from.x, 2) + 
    Math.pow(bond.to.y - bond.from.y, 2)
  );
  const radius = distance / 2 + 40; // Add some extra space for visual appeal

  // Calculate new positions for nucleotides in the loop
  for (let i = startIndex + 1; i < endIndex; i++) {
    // Calculate angle for this nucleotide in the arc
    const ratio = (i - startIndex) / (loopSize + 1);
    const angle = Math.PI - (Math.PI * ratio);

    // Calculate new position based on arc
    const newX = centerX + radius * Math.cos(angle);
    const newY = centerY + radius * Math.sin(angle);

    // Store the target position
    rnaChain[i].targetX = newX;
    rnaChain[i].targetY = newY;
  }

  // Start the animation
  animateFolding();
}

// Find all nucleotides that are complementary to the selected one
function findComplementaryNucleotides() {
  complementaryNucleotides = [];

  if (!selectedNucleotide) return;

    // Check if the selected nucleotide already has a bond (one-to-one rule)
    let selectedHasBond = false;
    for (const bond of hydrogenBonds) {
      if (bond.from === selectedNucleotide || bond.to === selectedNucleotide) {
        selectedHasBond = true;
        console.log('Selected nucleotide already has a bond');
        break;
      }
    }

    // If the selected nucleotide already has a bond, don't show any complementary options
    if (selectedHasBond) {
      return;
    }

    // Get the complementary type to the selected nucleotide
    const complementaryType = complementaryPairs[selectedNucleotide.type];

    // Find all nucleotides of this complementary type that don't already have bonds
    rnaChain.forEach(nucleotide => {
      if (nucleotide.type === complementaryType) {
        // Check if this nucleotide already has a bond
        let hasBond = false;
        for (const bond of hydrogenBonds) {
          if (bond.from === nucleotide || bond.to === nucleotide) {
            hasBond = true;
            break;
          }
        }

        // Only add to complementary list if it doesn't have a bond
        if (!hasBond) {
          complementaryNucleotides.push(nucleotide);
        }
    }
  });
}

// Add click event listener to the canvas
canvas.addEventListener('click', handleCanvasClick);

// Update RNA properties in the UI
function updateRNAProperties() {
  // Calculate stability based on bond types
  // A-U bonds = +5 points, G-C bonds = +10 points
  rnaStability = 0;
  rnaChemicalAffinities = [];

  hydrogenBonds.forEach(bond => {
    // Add stability points based on bond type
    if (bond.type === 'AU') {
      rnaStability += 5; // +5 points for A-U bonds
    } else {
      rnaStability += 10; // +10 points for G-C bonds
    }

    // Collect chemical affinities if there's a loop
    if (bond.chemicalAffinity && bond.chemicalAffinity !== 'None') {
      rnaChemicalAffinities.push(bond.chemicalAffinity);
    }
  });

  // Update stability display
  rnaStabilityElement.textContent = rnaStability + ' points';

  // Update length
  rnaLengthElement.textContent = rnaChain.length + ' nt';
}

// Update active functions based on loop analysis
function updateActiveFunctions() {
  // First check for complex dumbbell structures
  const dumbbellStructure = detectDumbbellStructure();

  if (dumbbellStructure) {
    // Set the active function to the combined function
    rnaActiveFunction = `Synthesis ${dumbbellStructure.loop1}+${dumbbellStructure.loop2}`;
  } else {
    // Count how many of each substance type we can bind
    const substancePCount = rnaChemicalAffinities.filter(aff => aff === 'Substance P').length;
    const substanceRCount = rnaChemicalAffinities.filter(aff => aff === 'Substance R').length;

    // Determine active function based on chemical affinities
    if (substancePCount > 0 && substanceRCount > 0) {
      // Multi-functional RNA can bind both substances
      if (substancePCount > 1 && substanceRCount > 1) {
        rnaActiveFunction = 'Multi-catalytic (P+R)';
      } else {
        rnaActiveFunction = 'Dual binding (P+R)';
      }
    } else if (substancePCount > 1) {
      rnaActiveFunction = 'Enhanced P binding';
    } else if (substanceRCount > 1) {
      rnaActiveFunction = 'Enhanced R binding';
    } else if (substancePCount === 1) {
      rnaActiveFunction = 'Substance P binding';
    } else if (substanceRCount === 1) {
      rnaActiveFunction = 'Substance R binding';
    } else if (rnaStability >= 25) {
      // If no chemical binding but high stability
      rnaActiveFunction = 'Structural support';
    } else if (rnaStability >= 15) {
      rnaActiveFunction = 'Stable structure';
    } else {
      rnaActiveFunction = 'None';
    }
  }

  // Update the UI
  rnaFunctionElement.textContent = rnaActiveFunction;

  // Apply visual styling based on function
  applyFunctionStyling();
}

// Detect dumbbell structures where two functional loops are connected by a stem
function detectDumbbellStructure() {
  // We need at least 4 hydrogen bonds to form a dumbbell structure (2 for each stem)
  if (hydrogenBonds.length < 4) {
    return null;
  }

  // Step 1: Find all functional loops
  const functionalLoops = [];
  hydrogenBonds.forEach(bond => {
    if (bond.chemicalAffinity && bond.chemicalAffinity !== 'None' && bond.loopNucleotides) {
      functionalLoops.push({
        bond: bond,
        startIndex: rnaChain.indexOf(bond.from),
        endIndex: rnaChain.indexOf(bond.to),
        affinity: bond.chemicalAffinity,
        nucleotides: bond.loopNucleotides
      });
    }
  });

  // We need at least 2 functional loops to form a dumbbell
  if (functionalLoops.length < 2) {
    return null;
  }

  // Step 2: Check if any pair of loops is connected by a stem
  for (let i = 0; i < functionalLoops.length; i++) {
    for (let j = i + 1; j < functionalLoops.length; j++) {
      const loop1 = functionalLoops[i];
      const loop2 = functionalLoops[j];

      // Check if the loops have different chemical affinities
      if (loop1.affinity === loop2.affinity) {
        continue; // We're looking for loops with different affinities
      }

      // Two cases: loop1 comes before loop2, or loop2 comes before loop1
      if (loop1.endIndex < loop2.startIndex) {
        // Check if there's a stem connecting them
        const hasStem = checkForStem(loop1.endIndex, loop2.startIndex);
        if (hasStem) {
          return {
            loop1: loop1.affinity.substr(10, 1), // Get 'P' from 'Substance P'
            loop2: loop2.affinity.substr(10, 1), // Get 'R' from 'Substance R'
          };
        }
      } 
      else if (loop2.endIndex < loop1.startIndex) {
        // Check if there's a stem connecting them
        const hasStem = checkForStem(loop2.endIndex, loop1.startIndex);
        if (hasStem) {
          return {
            loop1: loop2.affinity.substr(10, 1), // Get 'P' from 'Substance P'
            loop2: loop1.affinity.substr(10, 1), // Get 'R' from 'Substance R'
          };
        }
      }
    }
  }

  return null; // No dumbbell structure found
}

// Check if there's a stem connecting two regions of the RNA
function checkForStem(regionEndIndex, nextRegionStartIndex) {
  // We need at least one base pair between the regions to count as a stem
  let stemBondCount = 0;

  for (const bond of hydrogenBonds) {
    const fromIndex = rnaChain.indexOf(bond.from);
    const toIndex = rnaChain.indexOf(bond.to);

    // Check if this bond forms part of a stem connecting the two regions
    if ((fromIndex > regionEndIndex && fromIndex < nextRegionStartIndex) && 
        (toIndex > regionEndIndex && toIndex < nextRegionStartIndex)) {
      stemBondCount++;
    }
  }

  // Consider it a stem if there's at least one bond
  return stemBondCount > 0;
}

// Apply visual styling to the function display based on the active function
function applyFunctionStyling() {
  // Reset classes first
  rnaFunctionElement.className = 'property-value';

  // Add activated regulatory state styling if applicable
  if (isRNAActivated && regulatoryLoop) {
    rnaFunctionElement.classList.add('regulatory-active');

    // Override the active function text if in regulatory mode
    if (rnaActiveFunction === 'None') {
      rnaFunctionElement.textContent = 'Regulatory response active';
    }
  }

  // Apply specific styling based on function type
  if (rnaActiveFunction.includes('None') && !isRNAActivated) {
    // Default styling
    return;
  }

  if (rnaActiveFunction.includes('Synthesis')) {
    // Special styling for synthesis functions (dumbbell structures)
    rnaFunctionElement.classList.add('function-dual');
    rnaFunctionElement.classList.add('function-synthesis');
  } else if (rnaActiveFunction.includes('P') && rnaActiveFunction.includes('R')) {
    // Dual substance binding - gradient style
    rnaFunctionElement.classList.add('function-dual');
  } else if (rnaActiveFunction.includes('P')) {
    // P binding
    rnaFunctionElement.classList.add('function-p');
  } else if (rnaActiveFunction.includes('R')) {
    // R binding
    rnaFunctionElement.classList.add('function-r');
  } else if (rnaActiveFunction.includes('Structural') || rnaActiveFunction.includes('Stable')) {
    // Structural function
    rnaFunctionElement.classList.add('function-structural');
  }

  // Add animation for newly discovered functions
  rnaFunctionElement.classList.add('function-discovered');
  setTimeout(() => {
    rnaFunctionElement.classList.remove('function-discovered');
  }, 2000);
}

// Basic initialization
function init() {
  // Get DOM elements for RNA properties
  rnaStabilityElement = document.getElementById('rna-stability');
  rnaLengthElement = document.getElementById('rna-length');
  rnaFunctionElement = document.getElementById('rna-function');

  // Initialize substance S checkbox event listener
  const substanceSCheckbox = document.getElementById('substance-s-checkbox');
  substanceSCheckbox.addEventListener('change', function() {
    isLigandPresent = this.checked;
    console.log('Signaling substance S is ' + (isLigandPresent ? 'present' : 'absent'));

    // Check if RNA should be activated/deactivated
    checkRNAActivation();

    // Update RNA functions based on the new environment
    updateActiveFunctions();
  });

  // Generate and draw the RNA chain
  generateRNAChain();
  drawRNAChain();

  // Initialize the sequence viewer
  renderRNASequence();

  // Initialize RNA properties display
  updateRNAProperties();
  updateActiveFunctions();

  // Show a welcome message in the console
  console.log('RNA Folding Simulator initialized!');
  console.log('Create bonds between complementary nucleotides to form loops and discover active functions.');
}

// Initialize the game
init();
