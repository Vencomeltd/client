import { Fragment } from "react";
import { Link } from "react-router-dom";
import { parseRichText } from "../content/siteContent";

// Renders a site-content block: **bold**, [links](...) and paragraphs, as
// React elements (never raw HTML). `as` wraps each paragraph; `inline`
// joins paragraphs with line breaks inside one element instead.
export default function RichText({ value, as = "p", paragraphStyle, paragraphClassName, linkStyle, inline = false }) {
  const Tag = as;
  const paragraphs = parseRichText(value);
  const renderParts = (parts) =>
    parts.map((part, i) => {
      if (part.type === "bold") return <strong key={i}>{part.text}</strong>;
      if (part.type === "link") {
        return part.href.startsWith("/") ? (
          <Link key={i} to={part.href} style={linkStyle}>{part.text}</Link>
        ) : (
          <a key={i} href={part.href} style={linkStyle} {...(part.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}>
            {part.text}
          </a>
        );
      }
      return <Fragment key={i}>{part.text}</Fragment>;
    });

  if (inline) {
    return paragraphs.map((parts, i) => (
      <Fragment key={i}>
        {i > 0 && <><br /><br /></>}
        {renderParts(parts)}
      </Fragment>
    ));
  }
  return paragraphs.map((parts, i) => (
    <Tag key={i} style={paragraphStyle} className={paragraphClassName}>
      {renderParts(parts)}
    </Tag>
  ));
}
