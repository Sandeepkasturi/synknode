import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

// 1. Indicator Source
export const indicator_source_daily = Record({
    $id: Now.ID['indicator_source_daily'],
    table: 'pa_indicator_sources',
    data: {
        name: 'SynkNode.Events.Daily',
        description: 'Daily events from SynkNode',
        fact_table: 'x_synknode_events',
        filter: 'timestampONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()',
        frequency: '1' // Daily
    }
})

// 2. Automated Indicators
export const indicator_total_transfers = Record({
    $id: Now.ID['indicator_total_transfers'],
    table: 'pa_indicators',
    data: {
        name: 'Total transfers',
        description: 'COUNT of all records where event_type = file_transfer',
        indicator_source: Now.ref('pa_indicator_sources', 'indicator_source_daily'),
        aggregate: '1', // COUNT
        conditions: 'event_type=file_transfer',
        type: '1' // Automated
    }
})

export const indicator_total_page_visits = Record({
    $id: Now.ID['indicator_total_page_visits'],
    table: 'pa_indicators',
    data: {
        name: 'Total page visits',
        description: 'COUNT where event_type = page_visit',
        indicator_source: Now.ref('pa_indicator_sources', 'indicator_source_daily'),
        aggregate: '1', // COUNT
        conditions: 'event_type=page_visit',
        type: '1' // Automated
    }
})

export const indicator_active_users = Record({
    $id: Now.ID['indicator_active_users'],
    table: 'pa_indicators',
    data: {
        name: 'Active users',
        description: 'COUNT DISTINCT of sender_id',
        indicator_source: Now.ref('pa_indicator_sources', 'indicator_source_daily'),
        aggregate: '7', // COUNT_DISTINCT
        field: 'sender_id',
        type: '1' // Automated
    }
})

export const indicator_total_data_transferred = Record({
    $id: Now.ID['indicator_total_data_transferred'],
    table: 'pa_indicators',
    data: {
        name: 'Total data transferred (bytes)',
        description: 'SUM of size_bytes',
        indicator_source: Now.ref('pa_indicator_sources', 'indicator_source_daily'),
        aggregate: '2', // SUM
        field: 'size_bytes',
        type: '1' // Automated
    }
})

export const indicator_average_transfer_duration = Record({
    $id: Now.ID['indicator_average_transfer_duration'],
    table: 'pa_indicators',
    data: {
        name: 'Average transfer duration (ms)',
        description: 'AVG of transfer_duration_ms',
        indicator_source: Now.ref('pa_indicator_sources', 'indicator_source_daily'),
        aggregate: '3', // AVG
        field: 'transfer_duration_ms',
        type: '1' // Automated
    }
})

export const indicator_transfers_by_file_type = Record({
    $id: Now.ID['indicator_transfers_by_file_type'],
    table: 'pa_indicators',
    data: {
        name: 'Transfers by file type',
        description: 'COUNT grouped by file_type',
        indicator_source: Now.ref('pa_indicator_sources', 'indicator_source_daily'),
        aggregate: '1', // COUNT
        conditions: 'event_type=file_transfer',
        type: '1' // Automated
    }
})

export const indicator_transfers_per_hour = Record({
    $id: Now.ID['indicator_transfers_per_hour'],
    table: 'pa_indicators',
    data: {
        name: 'Transfers per hour',
        description: 'COUNT grouped by hour',
        indicator_source: Now.ref('pa_indicator_sources', 'indicator_source_daily'),
        aggregate: '1', // COUNT
        conditions: 'event_type=file_transfer',
        type: '1' // Automated
    }
})

export const indicator_daily_visits = Record({
    $id: Now.ID['indicator_daily_visits'],
    table: 'pa_indicators',
    data: {
        name: 'Daily visits',
        description: 'COUNT where event_type = page_visit grouped by DATE(timestamp)',
        indicator_source: Now.ref('pa_indicator_sources', 'indicator_source_daily'),
        aggregate: '1', // COUNT
        conditions: 'event_type=page_visit',
        type: '1' // Automated
    }
})

export const indicator_completed_transfers = Record({
    $id: Now.ID['indicator_completed_transfers'],
    table: 'pa_indicators',
    data: {
        name: 'Total completed transfers',
        description: 'COUNT where event_type = file_transfer AND transfer_status = completed',
        indicator_source: Now.ref('pa_indicator_sources', 'indicator_source_daily'),
        aggregate: '1', // COUNT
        conditions: 'event_type=file_transfer^transfer_status=completed',
        type: '1' // Automated
    }
})

export const indicator_transfer_success_rate = Record({
    $id: Now.ID['indicator_transfer_success_rate'],
    table: 'pa_indicators',
    data: {
        name: 'Transfer success rate',
        description: 'COUNT where transfer_status = completed / COUNT total (percentage)',
        type: '3', // Formula
        formula: '([[Total completed transfers]] / [[Total transfers]]) * 100',
        unit: '%'
    }
})

// 3. Dashboard
export const pa_dashboard = Record({
    $id: Now.ID['pa_dashboard'],
    table: 'pa_dashboards',
    data: {
        name: 'SynkNode Platform Analytics',
        description: 'Analytics for SynkNode peer-to-peer file transfer activity.',
        active: true,
        owner: 'admin'
    }
})

// Dashboard Tab
export const pa_dashboard_tab = Record({
    $id: Now.ID['pa_dashboard_tab'],
    table: 'pa_tabs',
    data: {
        name: 'Platform Analytics',
        description: 'SynkNode Overview Tab'
    }
})

// Dashboard to Tab link
export const pa_dashboard_tab_link = Record({
    $id: Now.ID['pa_dashboard_tab_link'],
    table: 'pa_m2m_dashboard_tabs',
    data: {
        dashboard: Now.ref('pa_dashboards', 'pa_dashboard'),
        tab: Now.ref('pa_tabs', 'pa_dashboard_tab'),
        order: 1
    }
})

// Dashboard permissions (sharing with admin role)
export const pa_dashboard_permission_admin = Record({
    $id: Now.ID['pa_dashboard_permission_admin'],
    table: 'pa_dashboards_permissions',
    data: {
        dashboard: Now.ref('pa_dashboards', 'pa_dashboard'),
        type: '1', // Role-based
        role: '2831a114c611228501d4ea6c309d626d', // admin role sys_id
        identity: 'admin',
        read: 'true',
        write: 'true',
        delete: 'true'
    }
})

// 4. PA Widgets
// Widget 1: Total transfers (Single Score)
export const widget_total_transfers = Record({
    $id: Now.ID['widget_total_transfers'],
    table: 'pa_widgets',
    data: {
        name: 'Total transfers',
        type: '2', // Score
        visualization: 'scorecard',
        indicator: Now.ref('pa_indicators', 'indicator_total_transfers')
    }
})

// Widget 2: Total page visits (Single Score)
export const widget_total_page_visits = Record({
    $id: Now.ID['widget_total_page_visits'],
    table: 'pa_widgets',
    data: {
        name: 'Total page visits',
        type: '2', // Score
        visualization: 'scorecard',
        indicator: Now.ref('pa_indicators', 'indicator_total_page_visits')
    }
})

// Widget 3: Active users (Single Score)
export const widget_active_users = Record({
    $id: Now.ID['widget_active_users'],
    table: 'pa_widgets',
    data: {
        name: 'Active users',
        type: '2', // Score
        visualization: 'scorecard',
        indicator: Now.ref('pa_indicators', 'indicator_active_users')
    }
})

// Widget 4: Total data transferred (Single Score)
export const widget_total_data_transferred = Record({
    $id: Now.ID['widget_total_data_transferred'],
    table: 'pa_widgets',
    data: {
        name: 'Total data transferred (bytes)',
        type: '2', // Score
        visualization: 'scorecard',
        indicator: Now.ref('pa_indicators', 'indicator_total_data_transferred')
    }
})

// Widget 5: Average transfer duration (Single Score)
export const widget_average_transfer_duration = Record({
    $id: Now.ID['widget_average_transfer_duration'],
    table: 'pa_widgets',
    data: {
        name: 'Average transfer duration (ms)',
        type: '2', // Score
        visualization: 'scorecard',
        indicator: Now.ref('pa_indicators', 'indicator_average_transfer_duration')
    }
})

// Widget 6: Transfers by file type (Pie Chart)
export const widget_transfers_by_file_type = Record({
    $id: Now.ID['widget_transfers_by_file_type'],
    table: 'pa_widgets',
    data: {
        name: 'Transfers by file type',
        type: '3', // Breakdown
        visualization: 'pie',
        indicator: Now.ref('pa_indicators', 'indicator_transfers_by_file_type')
    }
})

// Widget 7: Transfers per hour (Column Chart)
export const widget_transfers_per_hour = Record({
    $id: Now.ID['widget_transfers_per_hour'],
    table: 'pa_widgets',
    data: {
        name: 'Transfers per hour',
        type: '1', // Time Series
        visualization: 'column',
        indicator: Now.ref('pa_indicators', 'indicator_transfers_per_hour')
    }
})

// Widget 8: Daily visits (Bar Chart)
export const widget_daily_visits = Record({
    $id: Now.ID['widget_daily_visits'],
    table: 'pa_widgets',
    data: {
        name: 'Daily visits',
        type: '1', // Time Series
        visualization: 'bar',
        indicator: Now.ref('pa_indicators', 'indicator_daily_visits')
    }
})

// Widget 9: Transfer success rate (Gauge/Donut)
export const widget_transfer_success_rate = Record({
    $id: Now.ID['widget_transfer_success_rate'],
    table: 'pa_widgets',
    data: {
        name: 'Transfer success rate',
        type: '2', // Score
        visualization: 'dial', // Gauge dial
        indicator: Now.ref('pa_indicators', 'indicator_transfer_success_rate')
    }
})
