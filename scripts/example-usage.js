#!/usr/bin/env node

/**
 * Example usage of assignment scripts
 * This file demonstrates how to use the assignment scripts programmatically
 */

const { spawn } = require('child_process');
const path = require('path');

// Example sub-admin ID (replace with actual ID)
const EXAMPLE_SUB_ADMIN_ID = '64f8a1b2c3d4e5f6a7b8c9d0';

function runScript(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn('node', [scriptPath, ...args], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function demonstrateUsage() {
  console.log('🚀 Assignment & Unassignment Scripts Demo');
  console.log('========================================\n');

  try {
    console.log('📋 ASSIGNMENT SCRIPTS');
    console.log('=====================\n');

    // Example 1: Quick assignment
    console.log('📋 Example 1: Quick Assignment');
    console.log('Command: node scripts/quick-assign-completed-surveys.js <subAdminId>');
    console.log('This assigns all voters with completed surveys to the specified sub-admin\n');

    // Example 2: Dry run
    console.log('📋 Example 2: Dry Run (Test Mode)');
    console.log('Command: node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --dry-run');
    console.log('This shows what would be assigned without actually assigning\n');

    // Example 3: Filter by status
    console.log('📋 Example 3: Filter by Survey Status');
    console.log('Command: node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --status=verified');
    console.log('This assigns only voters with verified surveys\n');

    // Example 4: Filter by voter type
    console.log('📋 Example 4: Filter by Voter Type');
    console.log('Command: node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --voter-type=Voter');
    console.log('This assigns only Voter type (not VoterFour)\n');

    // Example 5: Custom batch size
    console.log('📋 Example 5: Custom Batch Size');
    console.log('Command: node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --batch-size=50');
    console.log('This processes assignments in batches of 50 voters\n');

    // Example 6: Combined options
    console.log('📋 Example 6: Combined Options');
    console.log('Command: node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --status=verified --voter-type=VoterFour --batch-size=25 --dry-run');
    console.log('This combines multiple filters for precise control\n');

    console.log('📋 UNASSIGNMENT SCRIPTS');
    console.log('======================\n');

    // Example 7: Quick unassignment
    console.log('📋 Example 7: Quick Unassignment');
    console.log('Command: node scripts/quick-unassign-all-voters.js <subAdminId>');
    console.log('This unassigns all voters from the specified sub-admin\n');

    // Example 8: Advanced unassignment
    console.log('📋 Example 8: Advanced Unassignment');
    console.log('Command: node scripts/unassign-all-voters-from-subadmin.js <subAdminId> --dry-run');
    console.log('This shows what would be unassigned without actually unassigning\n');

    // Example 9: Unassignment with batch size
    console.log('📋 Example 9: Unassignment with Custom Batch Size');
    console.log('Command: node scripts/unassign-all-voters-from-subadmin.js <subAdminId> --batch-size=50');
    console.log('This processes unassignments in batches of 50\n');

    console.log('📋 COMPLETE WORKFLOW EXAMPLES');
    console.log('============================\n');

    // Example 10: Complete workflow
    console.log('📋 Example 10: Complete Reassignment Workflow');
    console.log('Step 1: node scripts/quick-unassign-all-voters.js <subAdminIdA>');
    console.log('Step 2: node scripts/quick-assign-completed-surveys.js <subAdminIdB>');
    console.log('This unassigns all voters from sub-admin A and assigns completed surveys to sub-admin B\n');

    // Example 11: Test workflow
    console.log('📋 Example 11: Test Complete Workflow');
    console.log('Step 1: node scripts/unassign-all-voters-from-subadmin.js <subAdminId> --dry-run');
    console.log('Step 2: node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --dry-run');
    console.log('This tests both unassignment and assignment without making changes\n');

    console.log('💡 Tips:');
    console.log('- Always run with --dry-run first to test');
    console.log('- Use smaller batch sizes for large datasets');
    console.log('- Check existing assignments before running');
    console.log('- Monitor the output for progress and errors');
    console.log('- Unassign before reassigning for clean workflows\n');

    console.log('📚 For more information, see:');
    console.log('- SCRIPTS-ASSIGNMENT-GUIDE.md');
    console.log('- SUBADMIN-DELETION-VOTER-UNASSIGNMENT-GUIDE.md');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the demo
if (require.main === module) {
  demonstrateUsage();
}

module.exports = {
  runScript,
  demonstrateUsage
};
