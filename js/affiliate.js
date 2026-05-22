// Capture ?ref=<slug> from inbound URLs and persist for 30 days so the slug
// rides along to checkout even if the visitor browses for a while first.
(function () {
  try {
    var ref = new URL(window.location.href).searchParams.get('ref');
    if (ref) {
      document.cookie = 'affiliate_ref=' + encodeURIComponent(ref) +
        ';max-age=2592000;path=/;samesite=lax';
    }
  } catch (e) {}
})();
