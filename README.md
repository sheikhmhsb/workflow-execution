**Overview**
This project is designed to manage and execute automated workflows for contacts within a CRM system. It includes functionalities to send emails and SMS, update contact information, apply time delays, and handle conditional branching in workflows. The project uses MongoDB for data storage and the cron package to schedule workflow execution.

**Features**
1. Workflow Execution Logging: Logs the execution of each node in a workflow to avoid reprocessing.
2. Node Execution: Handles different types of nodes such as email, SMS, contact updates, time delays, and conditional splits.
3. Workflow Processing: Processes all active workflows for all contacts associated with each ownerId.
4. Conditional Branching: Evaluates conditions and branches the workflow based on the rules defined in the nodes.
5. Scheduled Execution: Uses cron to schedule and execute workflows at regular intervals.


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
