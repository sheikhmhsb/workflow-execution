**Overview**
This project is designed to manage and execute automated workflows for contacts within a CRM system. It includes functionalities to send emails and SMS, update contact information, apply time delays, and handle conditional branching in workflows. The project uses MongoDB for data storage and the cron package to schedule workflow execution.

**Features**
1. Workflow Execution Logging: Logs the execution of each node in a workflow to avoid reprocessing.
2. Node Execution: Handles different types of nodes such as email, SMS, contact updates, time delays, and conditional splits.
3. Workflow Processing: Processes all active workflows for all contacts associated with each ownerId.
4. Conditional Branching: Evaluates conditions and branches the workflow based on the rules defined in the nodes.
5. Scheduled Execution: Uses cron to schedule and execute workflows at regular intervals.


**Functions**
**hasNodeBeenExecuted**: Checks if a node has already been executed for a specific workflow and contact.
**logNodeExecution**: Logs the execution of a node.
**executeWorkflowNode**: Executes a node based on its type (email, timeDelay, updateContact, sms).
**processWorkflowsForAllContacts**: Fetches all active workflows and processes them for all contacts associated with each ownerId.
**processWorkflow**: Processes a single workflow for a single contact.
**sortNodesByEdges**: Sorts the workflow nodes based on the edges to determine the execution order.
**evaluateConditionsAndGetNextNode**: Evaluates conditions in a conditionSplit node and determines the next node to execute.

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
