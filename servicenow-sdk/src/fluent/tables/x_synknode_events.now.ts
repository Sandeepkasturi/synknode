import { Table, StringColumn, IntegerColumn, DateTimeColumn } from '@servicenow/sdk/core'

export const x_2064375_synknode_events = Table({
    name: 'x_2064375_synknode_events',
    label: 'SynkNode Events',
    schema: {
        event_type: StringColumn({ label: 'Event Type', maxLength: 50 }),
        sender_id: StringColumn({ label: 'Sender ID', maxLength: 100 }),
        receiver_id: StringColumn({ label: 'Receiver ID', maxLength: 100 }),
        file_name: StringColumn({ label: 'File Name', maxLength: 255 }),
        file_type: StringColumn({ label: 'File Type', maxLength: 50 }),
        file_extension: StringColumn({ label: 'File Extension', maxLength: 20 }),
        size_bytes: IntegerColumn({ label: 'Size Bytes' }),
        transfer_duration_ms: IntegerColumn({ label: 'Transfer Duration MS' }),
        transfer_status: StringColumn({ label: 'Transfer Status', maxLength: 20 }),
        visit_url: StringColumn({ label: 'Visit URL', maxLength: 500 }),
        referrer_url: StringColumn({ label: 'Referrer URL', maxLength: 500 }),
        visit_id: StringColumn({ label: 'Visit ID', maxLength: 100 }),
        session_id: StringColumn({ label: 'Session ID', maxLength: 100 }),
        timestamp: DateTimeColumn({ label: 'Timestamp' }),
        app_version: StringColumn({ label: 'App Version', maxLength: 20 })
    }
})
