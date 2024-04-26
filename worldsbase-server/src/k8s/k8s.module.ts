import { Module, Global } from '@nestjs/common';
import { K8sService } from './k8s.service';

@Global()
@Module({
  providers: [K8sService],
  exports: [K8sService],
})
export class K8sModule {}
