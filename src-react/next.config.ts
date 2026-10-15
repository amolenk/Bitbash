import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    // Bootstrap 5 still relies on Sass features deprecated in Dart Sass; it has to be
    // loaded with @import for variable overrides to work.
    quietDeps: true,
    silenceDeprecations: ["import", "legacy-js-api"],
  },
};

export default nextConfig;
