# Assignment & Unassignment Scripts Guide

Complete guide for using scripts to assign and unassign voters to/from sub-admins.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Available Scripts](#available-scripts)
- [Assignment Scripts](#assignment-scripts)
- [Unassignment Scripts](#unassignment-scripts)
- [Quick Start](#quick-start)
- [Detailed Usage](#detailed-usage)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🎯 Overview

These scripts help you automatically manage voter assignments to sub-admins. They support both assignment and unassignment operations:

### **Assignment Operations:**
- **Bulk Assignment**: Assign hundreds or thousands of voters at once
- **Survey-Based Assignment**: Only assign voters who have completed surveys
- **Automated Workflow**: Reduce manual assignment work
- **Data Consistency**: Ensure all surveyed voters are properly assigned

### **Unassignment Operations:**
- **Bulk Unassignment**: Remove all voters from a sub-admin
- **Clean Slate**: Clear assignments before reassigning
- **Sub-Admin Removal**: Prepare for sub-admin deletion
- **Reassignment Preparation**: Make voters available for new assignments

**Key Features:**
- ✅ Finds voters with completed surveys automatically
- ✅ Checks for existing assignments to avoid duplicates
- ✅ Processes operations in batches for performance
- ✅ Provides detailed progress and summary reports
- ✅ Supports dry-run mode for testing
- ✅ Handles both Voter and VoterFour collections
- ✅ Comprehensive error handling and validation

---

## 🛠️ Available Scripts

### **Assignment Scripts**

#### **1. Quick Assignment Script**
**File:** `scripts/quick-assign-completed-surveys.js`

**Purpose:** Simple, fast assignment of all voters with completed surveys

**Best for:** 
- Quick one-time assignments
- Simple use cases
- When you want minimal configuration

#### **2. Advanced Assignment Script**
**File:** `scripts/assign-completed-surveys-to-subadmin.js`

**Purpose:** Full-featured script with advanced options and filtering

**Best for:**
- Complex filtering requirements
- Large datasets requiring batch processing
- Testing with dry-run mode
- Custom survey status filtering

### **Unassignment Scripts**

#### **3. Quick Unassignment Script**
**File:** `scripts/quick-unassign-all-voters.js`

**Purpose:** Simple, fast unassignment of all voters from a sub-admin

**Best for:**
- Quick one-time unassignments
- Simple use cases
- When you want minimal configuration

#### **4. Advanced Unassignment Script**
**File:** `scripts/unassign-all-voters-from-subadmin.js`

**Purpose:** Full-featured script with advanced options and batch processing

**Best for:**
- Large datasets requiring batch processing
- Testing with dry-run mode
- Detailed reporting and validation

---

## 🚀 Quick Start

### **Prerequisites**
1. Ensure MongoDB is running
2. Set up environment variables (`.env` file)
3. Have a valid sub-admin ID

### **Basic Usage**

#### **Assignment:**
```bash
# Quick assignment (recommended for most cases)
node scripts/quick-assign-completed-surveys.js 64f8a1b2c3d4e5f6a7b8c9d0

# Advanced assignment with options
node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --dry-run
```

#### **Unassignment:**
```bash
# Quick unassignment (recommended for most cases)
node scripts/quick-unassign-all-voters.js 64f8a1b2c3d4e5f6a7b8c9d0

# Advanced unassignment with options
node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --dry-run
```

---

## 📖 Detailed Usage

### **Assignment Scripts**

#### **Quick Assignment Script**

**Syntax:**
```bash
node scripts/quick-assign-completed-surveys.js <subAdminId>
```

**What it does:**
1. Finds all voters with `status: 'completed'` surveys
2. Checks existing assignments to the sub-admin
3. Assigns only unassigned voters
4. Provides a summary report

#### **Advanced Assignment Script**

**Syntax:**
```bash
node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> [options]
```

**Options:**

| Option | Description | Default | Values |
|--------|-------------|---------|--------|
| `--dry-run` | Show what would be assigned without actually assigning | `false` | - |
| `--status=<status>` | Survey status to filter | `completed` | `draft`, `completed`, `submitted`, `verified`, `rejected` |
| `--voter-type=<type>` | Voter type to filter | `all` | `Voter`, `VoterFour`, `all` |
| `--batch-size=<size>` | Number of voters to process in each batch | `100` | Any positive integer |
| `--help` | Show help message | - | - |

### **Unassignment Scripts**

#### **Quick Unassignment Script**

**Syntax:**
```bash
node scripts/quick-unassign-all-voters.js <subAdminId>
```

**What it does:**
1. Finds all active assignments for the sub-admin
2. Unassigns all voters from the sub-admin
3. Provides a summary report

#### **Advanced Unassignment Script**

**Syntax:**
```bash
node scripts/unassign-all-voters-from-subadmin.js <subAdminId> [options]
```

**Options:**

| Option | Description | Default | Values |
|--------|-------------|---------|--------|
| `--dry-run` | Show what would be unassigned without actually unassigning | `false` | - |
| `--batch-size=<size>` | Number of assignments to process in each batch | `100` | Any positive integer |
| `--help` | Show help message | - | - |

---

## 💡 Examples

### **Assignment Examples**

#### **Example 1: Assign All Completed Surveys**

```bash
# Quick method
node scripts/quick-assign-completed-surveys.js 64f8a1b2c3d4e5f6a7b8c9d0

# Advanced method
node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --status=completed
```

#### **Example 2: Test Assignment (Dry Run)**

```bash
node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --dry-run
```

**Output:**
```
🚀 Starting assignment process...
📋 Configuration:
   - Sub-admin ID: 64f8a1b2c3d4e5f6a7b8c9d0
   - Survey status: completed
   - Voter type: all
   - Batch size: 100
   - Dry run: Yes

✅ Connected to MongoDB
✅ Sub-admin validated: John Doe (john.doe)
🔍 Finding voters with completed surveys...
📊 Found 1250 surveys with status: completed
👥 Unique voters found:
   - Voter: 800
   - VoterFour: 400
   - Total: 1200
🔍 Checking existing assignments...
📋 Assignment status:
   - Already assigned: 200 voters
   - New assignments needed: 1000 voters

🔄 Processing 650 Voter voters...
   📦 Processing batch 1/7 (100 voters)
   🔍 DRY RUN: Would assign 100 Voter voters
   📦 Processing batch 2/7 (100 voters)
   🔍 DRY RUN: Would assign 100 Voter voters
   ...

📊 Assignment Summary:
   - Total surveys processed: 1250
   - Unique voters found: 1200
   - Already assigned: 200
   - New assignments: 1000
   - Would assign:
     • Voter: 650
     • VoterFour: 350
     • Total: 1000

✅ Assignment process completed successfully!
```

#### **Example 3: Assign Only Verified VoterFour Surveys**

```bash
node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --status=verified --voter-type=VoterFour
```

#### **Example 4: Large Dataset with Small Batches**

```bash
node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --batch-size=25
```

### **Unassignment Examples**

#### **Example 5: Unassign All Voters**

```bash
# Quick method
node scripts/quick-unassign-all-voters.js 64f8a1b2c3d4e5f6a7b8c9d0

# Advanced method
node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0
```

**Output:**
```
🚀 Starting quick unassignment process...
📋 Sub-admin ID: 64f8a1b2c3d4e5f6a7b8c9d0
✅ Connected to MongoDB
✅ Sub-admin validated: John Doe
🔍 Finding current assignments...
📊 Found 1000 active assignments
👥 Assignment breakdown:
   - Voter: 650
   - VoterFour: 350
   - Total: 1000
🔄 Unassigning all voters...
✅ Successfully unassigned 1000 voters

📊 Unassignment Summary:
   - Sub-admin: John Doe (john.doe)
   - Total assignments found: 1000
   - Successfully unassigned: 1000
   - Assignment breakdown:
     • Voter: 650
     • VoterFour: 350

✅ Unassignment process completed successfully!
ℹ️  All unassigned voters are now available for reassignment to other sub-admins.
🔌 Database connection closed
```

#### **Example 6: Test Unassignment (Dry Run)**

```bash
node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --dry-run
```

**Output:**
```
🚀 Starting unassignment process...
📋 Configuration:
   - Sub-admin ID: 64f8a1b2c3d4e5f6a7b8c9d0
   - Batch size: 100
   - Dry run: Yes

✅ Connected to MongoDB
✅ Sub-admin validated: John Doe (john.doe)
🔍 Finding current assignments...
📊 Found 1000 active assignments
👥 Assignment breakdown:
   - Voter: 650
   - VoterFour: 350
   - Total: 1000
🔍 Getting voter details...
📋 Retrieved details for 1000 voters

🔄 Processing 1000 assignments...
   📦 Processing batch 1/10 (100 assignments)
   🔍 DRY RUN: Would unassign 100 voters
   📦 Processing batch 2/10 (100 assignments)
   🔍 DRY RUN: Would unassign 100 voters
   ...

📊 Unassignment Summary:
   - Sub-admin: John Doe (john.doe)
   - Total assignments found: 1000
   - Assignment breakdown:
     • Voter: 650
     • VoterFour: 350
   - Would unassign: 1000
   - Batches that would be processed: 10

✅ Unassignment process completed successfully!
ℹ️  All unassigned voters are now available for reassignment to other sub-admins.
🔌 Database connection closed
```

#### **Example 7: Large Dataset with Small Batches**

```bash
node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --batch-size=50
```

### **Complete Workflow Examples**

#### **Example 8: Complete Reassignment Workflow**

```bash
# Step 1: Unassign all voters from sub-admin A
node scripts/quick-unassign-all-voters.js 64f8a1b2c3d4e5f6a7b8c9d0

# Step 2: Assign completed surveys to sub-admin B
node scripts/quick-assign-completed-surveys.js 64f8a1b2c3d4e5f6a7b8c9d1
```

#### **Example 9: Test Complete Workflow**

```bash
# Step 1: Test unassignment
node scripts/unassign-all-voters-from-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d0 --dry-run

# Step 2: Test assignment
node scripts/assign-completed-surveys-to-subadmin.js 64f8a1b2c3d4e5f6a7b8c9d1 --dry-run
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. "Sub-admin not found" Error**
```bash
❌ Error: Sub-admin with ID 64f8a1b2c3d4e5f6a7b8c9d0 not found
```

**Solution:**
- Verify the sub-admin ID is correct
- Check if the sub-admin exists in the database
- Ensure the ID is a valid MongoDB ObjectId

#### **2. "MongoDB connection error"**
```bash
❌ MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Ensure MongoDB is running
- Check the connection string in `.env` file
- Verify network connectivity

#### **3. "No voters found" Message**
```bash
ℹ️  No voters found with the specified criteria. Exiting.
```

**Solution:**
- Check if there are surveys with the specified status
- Verify the survey status filter
- Check if voters exist in the database

#### **4. "All voters already assigned" Message**
```bash
ℹ️  All voters are already assigned to this sub-admin. Exiting.
```

**Solution:**
- This is normal if all voters are already assigned
- Check if you meant to assign to a different sub-admin
- Use the unassignment script first if needed

### **Debug Mode**

Add debug logging by modifying the script:

```javascript
// Add at the top of the script
console.log('Debug: Environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV
});
```

### **Check Database State**

```bash
# Connect to MongoDB and check data
mongo your-database-name

# Check surveys
db.surveys.find({status: "completed"}).count()

# Check assignments
db.voterassignments.find({subAdminId: ObjectId("your-subadmin-id")}).count()

# Check sub-admins
db.subadmins.find({_id: ObjectId("your-subadmin-id")})
```

---

## 🚀 Best Practices

### **1. Always Test First**
```bash
# Always run dry-run first
node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --dry-run
```

### **2. Use Appropriate Batch Sizes**
```bash
# For large datasets (10,000+ voters)
node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --batch-size=50

# For small datasets (< 1,000 voters)
node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --batch-size=100
```

### **3. Monitor Progress**
- Watch the console output for progress updates
- Check for error messages during batch processing
- Verify the final summary matches expectations

### **4. Backup Before Large Operations**
```bash
# Create a backup of assignments before major changes
mongodump --db your-database --collection voterassignments
```

### **5. Use Specific Filters**
```bash
# Instead of assigning all completed surveys
node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --status=completed

# Use more specific criteria
node scripts/assign-completed-surveys-to-subadmin.js <subAdminId> --status=verified --voter-type=Voter
```

### **6. Schedule Regular Assignments**
```bash
# Add to crontab for regular execution
# Run daily at 2 AM
0 2 * * * cd /path/to/your/project && node scripts/quick-assign-completed-surveys.js <subAdminId>
```

---

## 📊 Performance Considerations

### **Batch Size Guidelines**

| Dataset Size | Recommended Batch Size | Processing Time |
|--------------|----------------------|-----------------|
| < 1,000 voters | 100 | < 1 minute |
| 1,000 - 5,000 voters | 50 | 2-5 minutes |
| 5,000 - 10,000 voters | 25 | 5-10 minutes |
| > 10,000 voters | 10-25 | 10+ minutes |

### **Memory Usage**
- Each batch loads voter data into memory
- Larger batches use more memory but are faster
- Monitor system resources during large operations

### **Database Performance**
- Scripts use efficient MongoDB queries
- Batch processing reduces database load
- Indexes on `voterId`, `subAdminId`, and `status` improve performance

---

## 🔄 Integration with Other Scripts

### **Unassignment Before Assignment**
```bash
# First unassign all voters from a sub-admin
curl -X DELETE "http://localhost:3000/api/assignment/unassign-all/64f8a1b2c3d4e5f6a7b8c9d0"

# Then assign completed surveys
node scripts/quick-assign-completed-surveys.js 64f8a1b2c3d4e5f6a7b8c9d0
```

### **Check Assignment Status**
```bash
# Check current assignments
curl "http://localhost:3000/api/assignment/subadmin/64f8a1b2c3d4e5f6a7b8c9d0"
```

---

## 📚 Related Documentation

- [Sub-Admin Deletion & Voter Unassignment Guide](./SUBADMIN-DELETION-VOTER-UNASSIGNMENT-GUIDE.md)
- [Sub-Admin Surveys API Guide](./SUBADMIN-SURVEYS-API-GUIDE.md)
- [Voter Assignment API Guide](./example-voter-assignment-usage.md)

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your MongoDB connection and data
3. Test with dry-run mode first
4. Check server logs for detailed error messages

---

**Last Updated:** January 2025  
**Scripts Version:** 1.0.0  
**Files:**
- `scripts/quick-assign-completed-surveys.js`
- `scripts/assign-completed-surveys-to-subadmin.js`
