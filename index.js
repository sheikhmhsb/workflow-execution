const nodemailer = require('nodemailer');
const { getDb } = require('./database'); // Adjust this path as needed
const { ObjectId } = require('mongodb');
const { sendEmail } = require('./sendEmail');
const { delay } = require('./delay');
const { updateContactInfo } = require('./updateContactInfo');
const { sendSMS } = require('./sendSMS');
const { CronJob } = require('cron');

async function hasNodeBeenExecuted(workflowId, contactId, nodeType, nodeId) {
    const db = getDb();
    const collection = db.collection('workflowExecutionLog');
    const count = await collection.countDocuments({
        workflowId: workflowId,
        contactId: contactId,
        nodeType: nodeType,
        nodeId: nodeId
    });
    return count > 0;
}


async function logNodeExecution(workflowId, contactId, ownerId, nodeType, nodeId) {
    const db = getDb();
    const collection = db.collection('workflowExecutionLog');
    await collection.insertOne({
        workflowId: workflowId,
        contactId: contactId,
        ownerId: ownerId,
        nodeType: nodeType,
        nodeId: nodeId,
        executedAt: new Date()  // Captures the current date and time
    });
}

// Node execution function dispatching actions based on node type
async function executeWorkflowNode(node, contact, workflow) {
    if (await hasNodeBeenExecuted(workflow._id, contact._id, node.data.type, node.id)) {
        console.log(`Skipping execution for ${node.data.type}, already processed.`);
        return;
    }
    switch (node.data.type) {
        case 'email':
            await sendEmail(node.data, contact);
            break;
        case 'timeDelay':
            await delay(node.data);
            break;
        case 'updateContact':
            await updateContactInfo(node.data, contact);
            break;
        case 'conditionSplit':
            // conditionSplit handling is deferred to the workflow processor
            break;
        case 'sms':
            await sendSMS(node.data, contact);
            break;
        default:
            console.log('Unknown node type');
    }
    // Log the execution of this node
    await logNodeExecution(workflow._id, contact._id, workflow.ownerId, node.data.type, node.id);
}

// Fetch and process workflows for all contacts associated with each ownerId
async function processWorkflowsForAllContacts() {
    const db = getDb();
    const collection = db.collection('workflows');
    const workflows = await collection.find({ status: 'active' }).toArray();
    console.log(workflows);
    console.dir(workflows, { depth: null });
    for (const workflow of workflows) {
        const contacts = await db.collection('contacts').find({ ownerId: workflow.ownerId }).toArray();
        for (const contact of contacts) {
            await processWorkflow(workflow, contact);
        }
    }
    console.log('All workflows executed for all relevant contacts');
}

async function processWorkflow(workflow, contact) {
    const sortedNodes = sortNodesByEdges(workflow.nodes, workflow.edges);
    // console.log(sortedNodes, 'sortedNodes')
    for (let i = 0; i < sortedNodes.length; i++) {
        const node = sortedNodes[i];
        // console.log(node, 'node')
        // console.log(workflow._id, contact._id, node.data.type, 'workflow._id, contact._id, node..log')
        const alreadyExecuted = await hasNodeBeenExecuted(workflow._id, contact._id, node.data.type, node.id);
        // console.log(alreadyExecuted, 'alreadyExecuted')
        if (alreadyExecuted) {
            console.log(`Node ${node.data.type} has already been executed for contact ${contact._id}, skipping.`);
            continue;
        }
        await executeWorkflowNode(node, contact, workflow);
        if (node.data.type === 'conditionSplit') {
            const nextNodeId = evaluateConditionsAndGetNextNode(node, contact, workflow);
            if (nextNodeId) {
                i = sortedNodes.findIndex(n => n.id === nextNodeId) - 1;
            } else {
                console.error('Condition split node has no valid next node:', node);
                break;
            }
        }
    }
}


function sortNodesByEdges(nodes, edges) {
    let sortedNodes = [];
    let visited = new Set();
    let startNode = nodes.find(node => node.type === 'input');

    function visit(node) {
        if (!visited.has(node.id)) {
            visited.add(node.id);
            sortedNodes.push(node);
            let outgoingEdges = edges.filter(edge => edge.source === node.id);
            let uniqueTargets = new Set(outgoingEdges.map(edge => edge.target));
            uniqueTargets.forEach(targetId => {
                let targetNode = nodes.find(n => n.id === targetId);
                if (targetNode) {
                    visit(targetNode);
                }
            });
        }
    }

    if (startNode) {
        visit(startNode);
    }

    return sortedNodes;
}



function evaluateConditionsAndGetNextNode(node, contact, workflow) {
    if (!node.data.rules || !Array.isArray(node.data.rules)) {
        console.error('No rules defined in condition split node:', node);
        return null;
    }

    const conditionsMet = node.data.rules.every(rule => {
        const contactField = contact[rule.field];
        if (contactField === undefined) {
            console.error('Contact field does not exist:', rule.field);
            return false;
        }

        switch (rule.operator) {
            case '=':
                return contactField === rule.value;
            case '!=':
                return contactField !== rule.value;
            case '>':
                return contactField > rule.value;
            case '<':
                return contactField < rule.value;
            case 'contains':
                if (typeof contactField.includes === 'function') {
                    return contactField.includes(rule.value);
                }
                console.error('The includes method is not supported on the field:', rule.field);
                return false;
            default:
                console.error('Unsupported operator:', rule.operator);
                return false;
        }
    });

    const nextEdge = workflow.edges.find(edge =>
        edge.source === node.id && edge.data && edge.data.condition === (conditionsMet ? 'true' : 'false')
    );

    if (!nextEdge) {
        console.error('No next edge found for node:', node);
        return null;
    }

    return nextEdge.target;
}


let isRunning = false;

const job = new CronJob('0 */1 * * * *', function () {
    if (!isRunning) {
        isRunning = true;
        console.log('Starting the workflow processing');
        processWorkflowsForAllContacts()
            .then(() => console.log('Workflow processing complete.'))
            .catch(err => {
                console.error('Error executing workflows:', err);
            })
            .finally(() => {
                isRunning = false;
            });
    } else {
        console.log('Previous task still running. Skipping this schedule.');
    }
}, null, true, 'America/New_York');

job.start();
