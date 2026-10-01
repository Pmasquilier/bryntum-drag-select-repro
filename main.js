import { SchedulerPro } from '@bryntum/schedulerpro';

// Toggle with ?workaround in the URL
const useWorkaround = new URLSearchParams(location.search).has('workaround');

const logElement = document.getElementById('log');
const log = message => {
    logElement.textContent = `${new Date().toLocaleTimeString()}  ${message}\n` + logElement.textContent;
};

document.getElementById('mode').textContent = useWorkaround ? 'with workaround' : 'out of the box';
const toggle = document.getElementById('toggle');
toggle.textContent = useWorkaround ? 'switch to out of the box' : 'switch to workaround';
toggle.href = useWorkaround ? '?' : '?workaround';

// A busy day: one employee with four stacked shifts, so most of the cell is covered by events
const day = new Date(2026, 9, 5);
const at = (dayOffset, hour) => new Date(day.getFullYear(), day.getMonth(), day.getDate() + dayOffset, hour);

const scheduler = new SchedulerPro({
    appendTo  : 'container',
    startDate : at(0, 0),
    endDate   : at(7, 0),
    viewPreset : 'dayAndWeek',
    tickSize   : 160,
    eventLayout : 'stack',
    multiEventSelect : true,

    features : {
        eventDragSelect : true,
        // EventDragSelect is incompatible with these
        eventDragCreate : false,
        pan             : false
    },

    columns : [{ text : 'Employee', field : 'name', width : 160 }],

    project : {
        resources : [
            { id : 1, name : 'Anna' },
            { id : 2, name : 'Ben' }
        ],
        events : [
            { id : 1, resourceId : 1, name : 'Shift A', startDate : at(0, 0), endDate : at(1, 0) },
            { id : 2, resourceId : 1, name : 'Shift B', startDate : at(0, 0), endDate : at(1, 0) },
            { id : 3, resourceId : 1, name : 'Shift C', startDate : at(0, 0), endDate : at(1, 0) },
            { id : 4, resourceId : 1, name : 'Shift D', startDate : at(0, 0), endDate : at(1, 0) },
            { id : 5, resourceId : 2, name : 'Shift E', startDate : at(1, 0), endDate : at(2, 0) }
        ]
    },

    listeners : {
        // Planners must hold Shift to drag-select, a bare drag stays free
        beforeEventDragSelect : ({ event }) => event.shiftKey,

        beforeEventDrag({ event, domEvent }) {
            // Docs list `domEvent`, the payload carries `event`
            log(`beforeEventDrag  event: ${event?.type}  domEvent: ${domEvent}`);
            if (useWorkaround && event?.shiftKey) {
                return false;
            }
        },

        eventDrop : ({ eventRecords }) => log(`eventDrop  moved: ${eventRecords.map(e => e.name).join(', ')}`),

        // In the app, these two open a dialog
        eventClick    : ({ eventRecord, event }) => log(`eventClick  ${eventRecord.name}  shiftKey: ${event.shiftKey}`),
        scheduleClick : ({ event }) => log(`scheduleClick  shiftKey: ${event.shiftKey}`),

        eventSelectionChange : ({ source }) => log(`selection: ${source.selectedEvents.map(e => e.name).join(', ') || '(none)'}`),

        paint({ source, firstPaint }) {
            if (!useWorkaround || !firstPaint) {
                return;
            }
            // targetSelector is a class field assigned after the feature config, so it can't be configured
            const { eventDragSelect } = source.features;
            eventDragSelect.targetSelector = `${eventDragSelect.targetSelector}, ${source.eventSelector}, ${source.eventSelector} *`;
        }
    }
});

window.scheduler = scheduler;
