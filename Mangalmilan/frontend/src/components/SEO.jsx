import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, keywords, image, url }) => {
    const siteTitle = "Mangalmilan";
    const siteUrl = "https://mangalmilan.in";

    const defaultDescription =
        "Mangalmilan helps you find verified wedding vendors, venues, photographers, and makeup artists in Bhopal.";

    const defaultImage = `${siteUrl}/logo1.png`;

    const finalTitle = title
        ? `${title} | ${siteTitle}`
        : `${siteTitle} – Best Wedding Services in Bhopal`;

    const currentUrl = url || `${siteUrl}${window.location.pathname}`;

    return (
        <Helmet>
            {/* Basic SEO */}
            <title>{finalTitle}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content={description || defaultDescription} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={currentUrl} />

            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={finalTitle} />
            <meta
                property="og:description"
                content={description || defaultDescription}
            />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={currentUrl} />
            <meta name="twitter:title" content={finalTitle} />
            <meta
                name="twitter:description"
                content={description || defaultDescription}
            />
            <meta name="twitter:image" content={image || defaultImage} />
        </Helmet>
    );
};

export default SEO;
