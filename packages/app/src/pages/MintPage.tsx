import { useState } from "react";
import { BiCoin } from "react-icons/bi";

import { Button } from "~/components/Button";
import { Card } from "~/components/Card";
import { Input } from "~/components/Input";
import { NumberInput } from "~/components/NumberInput";
import { TOKEN_ID, MINT_AMOUNT } from "~/config";
import { useMint } from "~/hooks/useMint";

export default function MintPage() {
  const [tokenId, setTokenId] = useState(TOKEN_ID);
  const [amount, setAmount] = useState<string>(`${MINT_AMOUNT}`);
  const mint = useMint({ tokenId });

  return (
    <Card className="min-w-[auto] max-w-[400px]">
      <Card.Title>
        <BiCoin className="text-primary-500" />
        Mint
      </Card.Title>
      <div className="text-gray-300">
        Mint new token types for testing purposes by adding the contract Id and
        amount below.
      </div>
      <div className="faucetWidget--formRow">
        <label className="faucetWidget--label">Contract Id</label>
        <Input
          isReadOnly
          value={tokenId}
          placeholder="Type contract id"
          onChange={setTokenId}
        />
      </div>
      <div className="faucetWidget--formRow">
        <label className="faucetWidget--label">Amount to mint</label>
        <NumberInput
          className="px-2"
          value={amount}
          onChange={setAmount}
          isAllowed={(values) => (values.floatValue || 0) <= MINT_AMOUNT}
        />
      </div>
      <Button
        size="md"
        variant="primary"
        isFull
        className="mt-4"
        isLoading={mint.isLoading}
        onPress={() => mint.handleMint(amount)}
      >
        Mint tokens
      </Button>
    </Card>
  );
}