**Overview**
This project is designed to manage and execute automated workflows for contacts within a CRM system. It includes functionalities to send emails and SMS, update contact information, apply time delays, and handle conditional branching in workflows. The project uses MongoDB for data storage and the cron package to schedule workflow execution.

**Features**
1. Workflow Execution Logging: Logs the execution of each node in a workflow to avoid reprocessing.
2. Node Execution: Handles different types of nodes such as email, SMS, contact updates, time delays, and conditional splits.
3. Workflow Processing: Processes all active workflows for all contacts associated with each ownerId.
4. Conditional Branching: Evaluates conditions and branches the workflow based on the rules defined in the nodes.
5. Scheduled Execution: Uses cron to schedule and execute workflows at regular intervals.


**Code Explanation Functions**
1. **hasNodeBeenExecuted**: Checks if a node has already been executed for a specific workflow and contact.
2. **logNodeExecution**: Logs the execution of a node.
3. **executeWorkflowNode**: Executes a node based on its type (email, timeDelay, updateContact, sms).
4. **processWorkflowsForAllContacts**: Fetches all active workflows and processes them for all contacts associated with each ownerId.
5. **processWorkflow**: Processes a single workflow for a single contact.
6. **sortNodesByEdges**: Sorts the workflow nodes based on the edges to determine the execution order.
7. **evaluateConditionsAndGetNextNode**: Evaluates conditions in a conditionSplit node and determines the next node to execute.

**Execution Flow**
1. Initialize the Cron Job: Sets up a CronJob to run every minute to process workflows.
2. Fetch Active Workflows: Retrieves all active workflows from the database.
3. Process Workflows: For each workflow, fetches the associated contacts and processes each contact through the workflow nodes.
4. Node Execution: Each node is executed based on its type. If a node has already been executed, it is skipped.
5. Conditional Branching: For conditionSplit nodes, evaluates conditions and determines the next node to execute.

**Example**
An example of a workflow could include the following nodes:

Send an initial email.
Wait for a specific time delay.
Update contact information.
Send an SMS.
Evaluate conditions and branch accordingly.

# Wise Code Studio 🚀  

Welcome to **Wise Code Studio**, where we craft **high-performance web and mobile applications** using the latest technologies.  

## 🌐 Visit Our Website  
🔗 **[Wise Code Studio](https://wisecodestudio.com)**  
