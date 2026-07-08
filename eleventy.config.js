const path = require("node:path");

module.exports = function (eleventyConfig) {
  // Static assets (images, fonts, compiled CSS) copied through untouched.
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("_headers");

  // Watch the Tailwind source + compiled output so `--serve` rebuilds on change.
  eleventyConfig.addWatchTarget("assets/css/main.css");

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  // Jinja-style `selectattr` isn't built into Nunjucks — add a minimal filter
  // used to split the customerLogos collection into marquee rows.
  eleventyConfig.addFilter("selectattr", (arr, attr, test, value) => {
    if (!Array.isArray(arr)) return [];
    if (test === "equalto") return arr.filter((item) => item[attr] === value);
    return arr.filter((item) => Boolean(item[attr]));
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
