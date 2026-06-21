import { gs, GlideRecord, GlideAggregate } from '@servicenow/glide'

export function processSummary(request: any, response: any) {
    try {
        // 1. Total transfer count
        var countGA = new GlideAggregate("x_2064375_synknode_events");
        countGA.addQuery("event_type", "=", "file_transfer");
        countGA.addAggregate("COUNT", "sys_id");
        countGA.query();
        var totalTransfers = 0;
        if (countGA.next()) {
            totalTransfers = parseInt(countGA.getAggregate("COUNT", "sys_id")) || 0;
        }

        // 2. Total bytes transferred
        var bytesGA = new GlideAggregate("x_2064375_synknode_events");
        bytesGA.addQuery("event_type", "=", "file_transfer");
        bytesGA.addAggregate("SUM", "size_bytes");
        bytesGA.query();
        var totalBytes = 0;
        if (bytesGA.next()) {
            totalBytes = parseInt(bytesGA.getAggregate("SUM", "size_bytes")) || 0;
        }

        // 3. Average transfer duration in ms
        var durationGA = new GlideAggregate("x_2064375_synknode_events");
        durationGA.addQuery("event_type", "=", "file_transfer");
        durationGA.addAggregate("AVG", "transfer_duration_ms");
        durationGA.query();
        var avgDurationMs = 0;
        if (durationGA.next()) {
            avgDurationMs = parseFloat(durationGA.getAggregate("AVG", "transfer_duration_ms")) || 0;
        }

        // 4. Count of unique senders (users)
        var uniqueCount = 0;
        var sendersMap = {} as Record<string, boolean>;
        var senderGR = new GlideRecord("x_2064375_synknode_events");
        senderGR.addQuery("event_type", "file_transfer");
        senderGR.query();
        while (senderGR.next()) {
            var sId = senderGR.getValue("sender_id");
            if (sId && !sendersMap[sId]) {
                sendersMap[sId] = true;
                uniqueCount++;
            }
        }
        var uniqueSenders = uniqueCount;

        // 5. Breakdown of transfers by file_type
        var fileTypeGA = new GlideAggregate("x_2064375_synknode_events");
        fileTypeGA.addQuery("event_type", "=", "file_transfer");
        fileTypeGA.addAggregate("COUNT", "file_type");
        fileTypeGA.groupBy("file_type");
        fileTypeGA.query();
        var breakdown = [];
        while (fileTypeGA.next()) {
            var fType = fileTypeGA.getValue("file_type") || "unknown";
            var fCount = parseInt(fileTypeGA.getAggregate("COUNT", "file_type")) || 0;
            breakdown.push({
                file_type: fType,
                count: fCount
            });
        }

        response.setStatus(200);
        response.setBody({
            total_transfers: totalTransfers,
            total_bytes_transferred: totalBytes,
            average_transfer_duration_ms: avgDurationMs,
            unique_senders: uniqueSenders,
            file_type_breakdown: breakdown
        });

    } catch (ex: any) {
        gs.error("Error in SynkNode Summary GET API: " + ex.message);
        response.setStatus(500);
        response.setBody({ error: ex.message });
    }
}
