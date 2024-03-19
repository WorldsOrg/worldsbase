import axios from 'axios';
import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { DBService } from 'src/db/db.service';

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

@Injectable()
export class TriggerService {
  constructor(private databaseService: DBService) {}

  async sendTrigger(
    tableName: string,
    condition: string | null,
    data: Data | null,
  ) {
    try {
      const triggerResult = await this.databaseService.executeQuery(
        'SELECT * FROM trigger_functions',
      );

      if (!triggerResult.data || !Array.isArray(triggerResult.data[0].triggers))
        return;

      const transformedData: TransformedData = {
        tableName,
        data,
        conditionObject: condition ? this._parseCondition(condition) : null,
        trigger_id: randomUUID(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      triggerResult.data[0].triggers.forEach(
        async (trigger: { table: any; trigger: string }) => {
          if (trigger.table === tableName) {
            await axios
              .post(trigger.trigger, { transformedData })
              .catch((error) => console.error('Error sending trigger:', error));
          }
        },
      );
    } catch (error) {
      console.error('Error sending trigger:', error);
    }
  }

  _parseCondition(condition: string) {
    const [key, value] = condition.split('=').map((part) => part.trim());
    return { [key]: value.replace(/'/g, '') };
  }
}
