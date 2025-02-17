import cx from "classnames";
import type { IContentLoaderProps } from "react-content-loader";
import ContentLoader from "react-content-loader";

import { useBreakpoint } from "~/systems/Core";

export const Skeleton = (props: IContentLoaderProps) => {
  const breakpoint = useBreakpoint();
  const isSmall = breakpoint === "sm";
  const width = isSmall ? 300 : 410;

  return (
    <ContentLoader
      speed={2}
      width={width}
      height={300}
      viewBox={`0 0 ${width} 300`}
      backgroundColor="#17191C"
      foregroundColor="#2D3138"
      className={cx("opacity-30")}
      {...props}
    >
      <rect y="0" width="82" height="37" rx="10" />
      <rect y="51" width={width} height="85" rx="10" />
      <rect y="150" width={width} height="85" rx="10" />
      <rect y="249" width={width} height="51" rx="10" />
    </ContentLoader>
  );
};
