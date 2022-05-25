import { BiListUl } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

import { Accordion } from "~/components/Accordion";
import { Button } from "~/components/Button";
import { PreviewTable, PreviewItem } from "~/components/PreviewTable";
import { Spinner } from "~/components/Spinner";
import { TokenIcon } from "~/components/TokenIcon";
import { usePoolInfo } from "~/hooks/usePoolInfo";
import { useUserPositions } from "~/hooks/useUserPositions";
import CoinsMetadata from "~/lib/CoinsMetadata";
import { calculateRatio } from "~/lib/asset";
import { Pages } from "~/types/pages";

function WithoutPositions() {
  return (
    <p className="flex items-center gap-2 text-gray-300">
      <BiListUl />
      You may have no open positions
    </p>
  );
}

function PositionItem() {
  const navigate = useNavigate();
  const info = useUserPositions();
  const token = CoinsMetadata.find((c) => c.symbol === "ETH/DAI");
  const coinFrom = token?.pairOf?.[0];
  const coinTo = token?.pairOf?.[1];

  return (
    <Accordion.Item value="item-1">
      <Accordion.Trigger>
        <div className="flex items-center">
          <TokenIcon coinFrom={coinFrom} coinTo={coinTo} />
          ETH/DAI
        </div>
      </Accordion.Trigger>
      <Accordion.Content>
        <PreviewTable className="my-2">
          <PreviewItem
            title="Pooled DAI"
            value={
              <div className="inline-flex items-center gap">
                {info.pooledDAI} <TokenIcon coinFrom={coinTo} size={14} />
              </div>
            }
          />
          <PreviewItem
            title="Pooled ETH"
            value={
              <div className="inline-flex items-center gap">
                {info.pooledETH} <TokenIcon coinFrom={coinFrom} size={14} />
              </div>
            }
          />
          <PreviewItem title="Your pool tokens" value={info.poolTokens} />
          <PreviewItem title="Your pool share" value={`${info.poolShare}%`} />
        </PreviewTable>
        <div className="flex items-center justify-between gap-2 mt-3">
          <Button
            isFull
            onPress={() => navigate(`../${Pages["pool.addLiquidity"]}`)}
          >
            Add liquidity
          </Button>
          <Button
            isFull
            onPress={() => navigate(`../${Pages["pool.removeLiquidity"]}`)}
          >
            Remove liquidity
          </Button>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

export default function PoolsPreview() {
  const { data: poolInfo, isLoading } = usePoolInfo();
  const reservesFromToRatio = calculateRatio(
    poolInfo?.eth_reserve,
    poolInfo?.token_reserve
  );

  return (
    <div>
      <h3 className="pb-1 mb-3 mt-5 text-gray-100 border-b border-dashed border-gray-600">
        Your liquidity positions
      </h3>
      {isLoading && <Spinner />}
      {Boolean(!isLoading && !reservesFromToRatio) && <WithoutPositions />}
      {Boolean(!isLoading && reservesFromToRatio) && (
        <Accordion type="single" defaultValue="item-1" collapsible>
          <PositionItem />
        </Accordion>
      )}
    </div>
  );
}
