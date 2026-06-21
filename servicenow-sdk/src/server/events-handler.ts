import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide'

export function processEvents(request: any, response: any) {
    try {
        var reqBody = request.body.data;
        if (!reqBody) {
            response.setStatus(400);
            response.setBody({ error: "Missing request body" });
            return;
        }

        // Input validation
        var eventType = reqBody.event_type;
        var senderId = reqBody.sender_id || "";
        var fileName = reqBody.file?.name || reqBody.file_name || "";
        var timestampStr = reqBody.timestamp;

        if (!eventType) {
            response.setStatus(400);
            response.setBody({ error: "Missing required field: event_type" });
            return;
        }

        if (eventType === "file_transfer" && !senderId) {
            response.setStatus(400);
            response.setBody({ error: "Missing required field: sender_id for file_transfer" });
            return;
        }

        if (eventType === "file_transfer" && !fileName) {
            response.setStatus(400);
            response.setBody({ error: "Missing required field: file.name for file_transfer" });
            return;
        }

        if (!timestampStr) {
            response.setStatus(400);
            response.setBody({ error: "Missing required field: timestamp" });
            return;
        }

        // Insert into x_2064375_synknode_events using GlideRecord
        var gr = new GlideRecord("x_2064375_synknode_events");
        gr.initialize();
        gr.setValue("event_type", eventType);
        
        if (eventType === "file_transfer") {
            gr.setValue("sender_id", senderId);
            gr.setValue("receiver_id", reqBody.receiver_id || "");
            gr.setValue("file_name", fileName);
            gr.setValue("file_type", reqBody.file?.type || reqBody.file_type || "");
            gr.setValue("file_extension", reqBody.file?.extension || reqBody.file_extension || "");
            gr.setValue("size_bytes", reqBody.transfer?.bytes_transferred || reqBody.size_bytes || 0);
            gr.setValue("transfer_duration_ms", reqBody.transfer?.duration_ms || reqBody.transfer_duration_ms || 0);
            gr.setValue("transfer_status", reqBody.transfer?.status || reqBody.transfer_status || "completed");
        } else if (eventType === "page_visit") {
            gr.setValue("visit_url", reqBody.page?.url || reqBody.visit_url || "");
            gr.setValue("referrer_url", reqBody.page?.referrer || reqBody.referrer_url || "");
            gr.setValue("visit_id", reqBody.visit_id || reqBody.page?.visit_id || "");
        }
        
        // General falls-back
        gr.setValue("visit_url", reqBody.page?.url || reqBody.visit_url || gr.getValue("visit_url"));
        gr.setValue("referrer_url", reqBody.page?.referrer || reqBody.referrer_url || gr.getValue("referrer_url"));
        gr.setValue("visit_id", reqBody.page?.visit_id || reqBody.visit_id || gr.getValue("visit_id"));
        gr.setValue("session_id", reqBody.session_id || "");
        
        // Handle timestamp formatting for GlideDateTime
        var gdt = new GlideDateTime(timestampStr.replace("T", " ").replace("Z", ""));
        gr.setValue("timestamp", gdt);
        
        gr.setValue("app_version", reqBody.meta?.version || reqBody.app_version || "1.0.0");
        
        var sysId = gr.insert();
        if (sysId) {
            response.setStatus(201);
            response.setBody({ result: "Created", sys_id: sysId });
        } else {
            response.setStatus(500);
            response.setBody({ error: "Failed to insert record" });
        }
    } catch (ex: any) {
        gs.error("Error in SynkNode Events POST API: " + ex.message);
        response.setStatus(500);
        response.setBody({ error: ex.message });
    }
}
