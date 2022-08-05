import React from "react";
import "./Breadcrumbs.css";

type BreadcrumbProps = {
  children: React.ReactNode;
}

export default function Breadcrumbs(props: BreadcrumbProps) {
  return (
    <div className='breadcrumb-container'>
      {React.Children.toArray(props.children)[0]}
      {React.Children.toArray(props.children).slice(1).map((child, index) => {
        return (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="9" r="1.5"></circle></svg>
            {child}
          </>
        );
      })}
    </div>
  );
}