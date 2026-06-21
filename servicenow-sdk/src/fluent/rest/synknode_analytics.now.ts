import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { processEvents } from '../../server/events-handler'
import { processSummary } from '../../server/summary-handler'

export const synknode_analytics_api = RestApi({
    $id: Now.ID['synknode_analytics_api'],
    name: 'SynkNode Analytics',
    serviceId: 'synknode_analytics',
    routes: [
        {
            $id: Now.ID['events_route'],
            name: 'events',
            method: 'POST',
            path: '/events',
            script: processEvents
        },
        {
            $id: Now.ID['summary_route'],
            name: 'summary',
            method: 'GET',
            path: '/summary',
            script: processSummary
        }
    ]
})
