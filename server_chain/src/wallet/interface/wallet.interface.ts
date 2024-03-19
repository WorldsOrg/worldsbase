export class TurnkeyWallet {
  readonly address: string;
}

export class EthWallet {
  readonly address: string;
  readonly privateKey: string;
  readonly user_id: string;
}

export class EncrytedKey {
  readonly encrypted: string;
}
