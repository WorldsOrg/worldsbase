// triggerService.js
import axios from "axios";
import { randomUUID } from "crypto";
import { supabase } from "../../config/supabase/client";

interface Data {
  [key: string]: string | number | boolean;
}

interface ConditionObject {
  [key: string]: string;
}

interface TransformedData {
  tableName: string;
  data: Data | null;
  conditionObject: ConditionObject | null;
  trigger_id: string;
}

class TriggerService {
  async sendTrigger(tableName: string, condition: string | null, data: Data | null) {
    try {
      const triggerResult = await supabase.from("triggers").select("*").single();
      if (!triggerResult.data || !Array.isArray(triggerResult.data.triggers)) return;

      const transformedData: TransformedData = {
        tableName,
        data,
        conditionObject: condition ? this._parseCondition(condition) : null,
        trigger_id: randomUUID(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      triggerResult.data.triggers.forEach(async (trigger: { table: any; trigger: string }) => {
        if (trigger.table === tableName) {
          await axios.post(trigger.trigger, { transformedData }).catch((error) => console.error("Error sending trigger:", error));
        }
      });
    } catch (error) {
      console.error("Error sending trigger:", error);
    }
  }

  _parseCondition(condition: string) {
    const [key, value] = condition.split("=").map((part) => part.trim());
    return { [key]: value.replace(/'/g, "") };
  }
}

export const triggerService = new TriggerService();
