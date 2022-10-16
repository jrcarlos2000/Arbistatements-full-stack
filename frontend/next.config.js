/** @type {import('next').NextConfig} */
module.exports = {
  future: {
    webpack5: true, // by default, if you customize webpack config, they switch back to version 4. 
      // Looks like backward compatibility approach.
  },
  compilerOptions : {
    baseUrl: "."
   },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
        // by next.js will be dropped. Doesn't make much sense, but how it is
      fs: false, // the solution
    };

    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules/,
      type: 'javascript/auto',
    })
    // config.module.rules.push({
    //   test: /\.mjs$/,
    //   include: /node_modules/,
    //   type: 'javascript/auto',
    // })

    return config;
  },
};
