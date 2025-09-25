export default function BannerCarousel() {
  const messages = [
    "Seja bem-vindo à Rádio Play, a rádio parceira das rádios.",
    "Cadastre-se agora mesmo e comece seus ganhos.",
    "Converta seus pontos em Pix direto na conta. Promoção por tempo limitado."
  ];

  return (
    <div className="bg-primary text-white py-2 relative" data-testid="banner-carousel">
      <div className="marquee-container">
        <div className="marquee-content">
          {/* First set of messages */}
          {messages.map((message, index) => (
            <span
              key={`first-${index}`}
              className="inline-block px-16 text-sm md:text-base font-medium"
              data-testid={`banner-message-${index}`}
            >
              {message}
            </span>
          ))}
          {/* Duplicate set for seamless loop */}
          {messages.map((message, index) => (
            <span
              key={`second-${index}`}
              className="inline-block px-16 text-sm md:text-base font-medium"
              data-testid={`banner-message-duplicate-${index}`}
            >
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}