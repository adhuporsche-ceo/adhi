// AI logic for wait times, recommendations, and crowd estimation

export interface CrowdStatus {
  status: 'LOW' | 'MEDIUM' | 'HIGH';
  count: number;
  message: string;
}

// 1. Predict Wait Time based on food baseline and active queue load
export function predictWaitTime(basePrepTime: number, activeQueueSize: number): number {
  // Base wait time + 1.5 minutes per active item in queue
  const loadFactor = activeQueueSize * 1.5;
  const estimatedTime = Math.ceil(basePrepTime + loadFactor);
  return Math.min(estimatedTime, 60); // Cap at 60 minutes
}

// 2. Queue Optimization prioritization score
export function calculatePriorityScore(itemCount: number, prepComplexity: number, queueWaitMinutes: number): number {
  // Simple heuristic: higher score = higher priority
  // Wait time increases priority (prevent starvation)
  // Low complexity (fast items) get a slight boost to clear queues
  const timeWeight = queueWaitMinutes * 2.0;
  const complexityPenalty = prepComplexity * 0.5;
  const sizeWeight = itemCount * 0.3;
  return Number((timeWeight - complexityPenalty + sizeWeight).toFixed(2));
}

// 3. Peak-Hour Prediction & Smart Crowd Detection
export function getLiveCrowdMeter(): CrowdStatus {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeVal = hours + minutes / 60;

  // Let's simulate college canteen breaks
  // Break 1: 10:30 AM - 11:00 AM (Medium)
  // Break 2 (Lunch): 12:30 PM - 2:00 PM (High)
  // Break 3 (Evening): 4:30 PM - 5:15 PM (Medium)
  // Other times: Low
  
  if (timeVal >= 12.5 && timeVal <= 14.0) {
    return {
      status: 'HIGH',
      count: Math.floor(Math.random() * 25) + 40, // 40-65 students
      message: 'Peak Lunch Hour Rush. Expect longer queue times.'
    };
  } else if ((timeVal >= 10.5 && timeVal <= 11.0) || (timeVal >= 16.5 && timeVal <= 17.25)) {
    return {
      status: 'MEDIUM',
      count: Math.floor(Math.random() * 15) + 15, // 15-30 students
      message: 'Moderate crowd. Average wait times apply.'
    };
  } else {
    return {
      status: 'LOW',
      count: Math.floor(Math.random() * 8) + 2, // 2-10 students
      message: 'Canteen is mostly empty. Ideal time to order!'
    };
  }
}

// Simulated CCTV Smart Crowd Detection logic
// In a real setup, this analyzes raw video frames, but here we run a simulated canvas analyzer 
// that detects "person bounds" and returns crowd coordinates
export interface DetectedPerson {
  x: number;
  y: number;
  confidence: number;
}

export function simulateCctvAnalysis(seed: number = 0.5): {
  count: number;
  congestion: 'LOW' | 'MEDIUM' | 'HIGH';
  detections: DetectedPerson[];
} {
  const studentCount = Math.floor(seed * 45) + 3; // 3 to 48 people
  const detections: DetectedPerson[] = [];

  for (let i = 0; i < studentCount; i++) {
    // Random spots on a 640x480 frame
    detections.push({
      x: Math.floor(Math.random() * 580) + 30,
      y: Math.floor(Math.random() * 400) + 50,
      confidence: Number((0.75 + Math.random() * 0.23).toFixed(2))
    });
  }

  let congestion: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (studentCount > 30) congestion = 'HIGH';
  else if (studentCount > 12) congestion = 'MEDIUM';

  return {
    count: studentCount,
    congestion,
    detections
  };
}
