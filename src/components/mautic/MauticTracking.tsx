/**
 * اسکریپت ردیابی Mautic - در تمام صفحات قبل از </body> لود می‌شود.
 * آدرس Mautic از env: NEXT_PUBLIC_MAUTIC_URL (مثال: https://mautic.yoursite.com)
 */
export function MauticTracking() {
  const baseUrl = process.env.NEXT_PUBLIC_MAUTIC_URL?.trim();
  if (!baseUrl) return null;

  const scriptContent = `
(function(w,d,t,u,n,s,e){
  w['MauticTrackingObject']=n;
  w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
  s=d.createElement(t);
  e=d.getElementsByTagName(t)[0];
  s.async=1;
  s.src=u;
  e.parentNode.insertBefore(s,e);
})(window,document,'script','${baseUrl.replace(/\/$/, "")}/mtc.js','mt');
mt('send', 'pageview');
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: scriptContent }}
      type="text/javascript"
    />
  );
}
