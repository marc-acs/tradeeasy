/**
 * Scheduler Service
 * Manages scheduled jobs for data polling and other periodic tasks
 */
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Import jobs
const priceDataJob = require('./jobs/priceDataJob');

// Load environment variables
dotenv.config();

// Store active jobs
const activeJobs = new Map();

/**
 * Initialize the scheduler service
 */
const initScheduler = () => {
  console.log('Initializing scheduler service...');
  
  // Check if scheduler is disabled (for testing or development)
  if (process.env.DISABLE_SCHEDULER === 'true') {
    console.log('Scheduler is disabled via environment variable');
    return false;
  }
  
  try {
    // Register the price data polling job
    const priceJobId = 'price-data-refresh';
    const priceJobCron = process.env.PRICE_POLL_SCHEDULE || '0 * * * *'; // Default: Every hour
    
    console.log(`Scheduling price data polling job with cron: ${priceJobCron}`);
    
    const priceJob = schedule.scheduleJob(priceJobCron, async () => {
      try {
        const startTime = new Date();
        console.log(`[${startTime.toISOString()}] Running scheduled price data refresh...`);
        
        await priceDataJob.run();
        
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        console.log(`[${endTime.toISOString()}] Price data refresh completed in ${duration}s`);
      } catch (error) {
        console.error(`Error in price data job: ${error.message}`, error);
      }
    });
    
    // Store the job reference
    activeJobs.set(priceJobId, priceJob);
    
    // Schedule future jobs by loading them from the jobs directory
    loadAdditionalJobs();
    
    console.log(`Scheduler initialized with ${activeJobs.size} active jobs`);
    return true;
  } catch (error) {
    console.error('Failed to initialize scheduler:', error);
    return false;
  }
};

/**
 * Load additional jobs from the jobs directory
 */
const loadAdditionalJobs = () => {
  try {
    const jobsDir = path.join(__dirname, 'jobs');
    
    // Skip if directory doesn't exist (tests, etc.)
    if (!fs.existsSync(jobsDir)) {
      return;
    }
    
    // Read job files (skip the ones we already loaded explicitly)
    const jobFiles = fs.readdirSync(jobsDir)
      .filter(file => file.endsWith('.js') && file !== 'priceDataJob.js');
    
    for (const file of jobFiles) {
      try {
        const jobId = path.basename(file, '.js');
        
        // Skip if already loaded
        if (activeJobs.has(jobId)) {
          continue;
        }
        
        // Get environment variable name for the cron schedule
        const envName = `${jobId.toUpperCase().replace(/-/g, '_')}_SCHEDULE`;
        
        // Default to daily at midnight if not specified
        const cronSchedule = process.env[envName] || '0 0 * * *';
        
        // Load the job module
        const jobModule = require(path.join(jobsDir, file));
        
        // Schedule the job
        if (typeof jobModule.run === 'function') {
          console.log(`Scheduling job ${jobId} with cron: ${cronSchedule}`);
          
          const job = schedule.scheduleJob(cronSchedule, async () => {
            try {
              const startTime = new Date();
              console.log(`[${startTime.toISOString()}] Running scheduled job: ${jobId}`);
              
              await jobModule.run();
              
              const endTime = new Date();
              const duration = (endTime - startTime) / 1000;
              console.log(`[${endTime.toISOString()}] Job ${jobId} completed in ${duration}s`);
            } catch (error) {
              console.error(`Error in job ${jobId}: ${error.message}`, error);
            }
          });
          
          activeJobs.set(jobId, job);
        }
      } catch (error) {
        console.error(`Error loading job from file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error loading additional jobs:', error);
  }
};

/**
 * Run a job manually regardless of schedule
 * @param {string} jobId - The ID of the job to run
 * @returns {Promise<boolean>} - Success status
 */
const runJobManually = async (jobId) => {
  try {
    console.log(`Manually running job: ${jobId}`);
    
    // Handle explicitly registered jobs
    if (jobId === 'price-data-refresh') {
      await priceDataJob.run();
      return true;
    }
    
    // Try to load job from file
    try {
      const jobPath = path.join(__dirname, 'jobs', `${jobId}.js`);
      if (fs.existsSync(jobPath)) {
        const jobModule = require(jobPath);
        if (typeof jobModule.run === 'function') {
          await jobModule.run();
          return true;
        }
      }
    } catch (error) {
      console.error(`Error running job ${jobId} manually:`, error);
    }
    
    return false;
  } catch (error) {
    console.error(`Error in manual job execution ${jobId}:`, error);
    return false;
  }
};

/**
 * Stop all scheduled jobs
 */
const stopAllJobs = () => {
  console.log('Stopping all scheduled jobs...');
  
  for (const [jobId, job] of activeJobs.entries()) {
    job.cancel();
    console.log(`Cancelled job: ${jobId}`);
  }
  
  activeJobs.clear();
  console.log('All jobs stopped');
};

// Export scheduler functions
module.exports = {
  initScheduler,
  runJobManually,
  stopAllJobs,
  getActiveJobs: () => Array.from(activeJobs.keys())
};