type ExternalRedirectProps = {
    to: string
}

function ExternalRedirect(props: ExternalRedirectProps) {
    window.location.replace(props.to);
    return null;
}

export default ExternalRedirect;