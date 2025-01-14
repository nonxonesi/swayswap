import cx from "classnames";
import type { ReactNode } from "react";
import { useState, useEffect, forwardRef } from "react";
import { FiChevronDown } from "react-icons/fi";

import { TOKENS } from "../utils";

import { CoinsListDialog } from "./CoinsListDialog";
import { TokenIcon } from "./TokenIcon";

import { Button, Dialog, Tooltip, useDialog } from "~/systems/UI";
import type { Coin } from "~/types";

export type CoinSelectorProps = {
  coin?: Coin | null;
  isReadOnly?: boolean;
  onChange?: (coin: Coin) => void;
  tooltip?: ReactNode;
};

export const CoinSelector = forwardRef<HTMLDivElement, CoinSelectorProps>(
  ({ coin, isReadOnly, onChange, tooltip: tooltipContent }, ref) => {
    const [selected, setSelected] = useState<Coin | null>(null);
    const dialog = useDialog();

    function handleSelect(assetId: string) {
      const next = TOKENS.find((item) => item.assetId === assetId)!;
      dialog.close();
      setSelected(next);
      onChange?.(next);
    }

    const button = (
      <Button
        aria-label="Coin Selector"
        {...dialog.openButtonProps}
        size="md"
        isReadOnly={isReadOnly}
        className={cx("coinSelector", {
          "coinSelector--empty": !selected,
        })}
      >
        {selected &&
          (selected.img ||
            (coin?.pairOf && coin?.pairOf[0].img && coin?.pairOf[1].img)) && (
            <TokenIcon
              {...(coin?.pairOf
                ? { coinFrom: coin.pairOf[0], coinTo: coin.pairOf[1] }
                : { coinFrom: coin })}
            />
          )}
        {selected ? (
          <div className="ml-1">{selected?.name}</div>
        ) : (
          <div className="ml-2">Select token</div>
        )}
        {!isReadOnly && <FiChevronDown className="text-current" />}
      </Button>
    );

    useEffect(() => {
      if (!coin) return setSelected(null);
      setSelected(coin);
    }, [coin]);

    return (
      <div className="coinSelector--root" ref={ref}>
        {tooltipContent ? (
          <Tooltip content={tooltipContent}>{button}</Tooltip>
        ) : (
          button
        )}
        <Dialog {...dialog.dialogProps}>
          <Dialog.Content>
            <CoinsListDialog onSelect={handleSelect} />
          </Dialog.Content>
        </Dialog>
      </div>
    );
  }
);
