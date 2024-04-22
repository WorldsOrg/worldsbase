import { Injectable } from '@nestjs/common';
import k8s from '@kubernetes/client-node';

@Injectable()
export class K8sService {
  private k8sApi: k8s.CoreV1Api;

  constructor() {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  }

  async updateConfigMap(
    namespace: string,
    configMapName: string,
    fileName: string,
    fileContent: string,
  ): Promise<void> {
    try {
      const { body: existingConfigMap } =
        await this.k8sApi.readNamespacedConfigMap(configMapName, namespace);
      if (!existingConfigMap.data) {
        existingConfigMap.data = {};
      }
      existingConfigMap.data[fileName] = fileContent;
      await this.k8sApi.replaceNamespacedConfigMap(
        configMapName,
        namespace,
        existingConfigMap,
      );
      return;
    } catch (err) {
      console.error('Error updating ConfigMap:', err);
      return;
    }
  }
}
