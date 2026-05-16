export type IconKey =
    | 'badge'
    | 'book'
    | 'cake'
    | 'camera'
    | 'gift'
    | 'heart'
    | 'image'
    | 'link'
    | 'mail'
    | 'map'
    | 'music'
    | 'palette'
    | 'pen'
    | 'phone'
    | 'puzzle'
    | 'qr'
    | 'sparkles'
    | 'users';

export type NavLink = {
    label: string;
    href: string;
};

export type Step = {
    title: string;
    description: string;
    icon: IconKey;
};

export type ShowcaseItem = {
    title: string;
    description: string;
    tag: string;
    icon: IconKey;
    tone: 'kraft' | 'rose' | 'wine' | 'olive' | 'gold';
};

export type Benefit = {
    title: string;
    description: string;
    icon: IconKey;
};

export type Testimonial = {
    name: string;
    context: string;
    quote: string;
    initials: string;
};

export type FaqItem = {
    question: string;
    answer: string;
};

export const brandName = 'Scrapbook';

export const navLinks: NavLink[] = [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Templates', href: '#templates' },
    { label: 'Demo', href: '/demo' },
    { label: 'FAQ', href: '#faq' },
];

export const announcement = 'Mais de 1.000 memórias prontas para virar presente digital';

export const howItWorksSteps: Step[] = [
    {
        title: 'Escolha a ocasião',
        description: 'Amor, aniversário, amizade ou aquela data que merece ficar guardada.',
        icon: 'gift',
    },
    {
        title: 'Selecione um template',
        description: 'Comece por um modelo bonito, com páginas pensadas para emocionar.',
        icon: 'book',
    },
    {
        title: 'Personalize os detalhes',
        description: 'Troque fotos, cartas, música, adesivos e pequenas surpresas.',
        icon: 'palette',
    },
    {
        title: 'Envie e emocione',
        description: 'Compartilhe por link ou QR Code e deixe a pessoa abrir no celular.',
        icon: 'qr',
    },
];

export const showcaseItems: ShowcaseItem[] = [
    {
        title: 'Capa do scrapbook',
        description: 'Primeira página com nome, data e clima de presente feito à mão.',
        tag: 'Abertura',
        icon: 'book',
        tone: 'kraft',
    },
    {
        title: 'Carta principal',
        description: 'Um espaço para escrever aquilo que não caberia em uma mensagem comum.',
        tag: 'Emoção',
        icon: 'mail',
        tone: 'rose',
    },
    {
        title: 'Galeria de polaroids',
        description: 'Fotos em formato de colagem, com legendas e memórias pequenas.',
        tag: 'Fotos',
        icon: 'camera',
        tone: 'gold',
    },
    {
        title: 'Musica especial',
        description: 'A trilha do casal, da amizade ou da data dentro da experiência.',
        tag: 'Som',
        icon: 'music',
        tone: 'wine',
    },
    {
        title: 'Mapa afetivo',
        description: 'Lugares que importam, encontros marcantes e pequenas histórias.',
        tag: 'Lugares',
        icon: 'map',
        tone: 'olive',
    },
    {
        title: 'Coisas que amo em você',
        description: 'Uma página delicada para listar detalhes, manias e motivos.',
        tag: 'Carinho',
        icon: 'heart',
        tone: 'rose',
    },
    {
        title: 'Quebra-cabeca com foto',
        description: 'Uma interação simples para revelar uma lembrança aos poucos.',
        tag: 'Interativo',
        icon: 'puzzle',
        tone: 'kraft',
    },
    {
        title: 'Página de aniversário',
        description: 'Mensagem, bolo, fotos e desejos para transformar a data.',
        tag: 'Data',
        icon: 'cake',
        tone: 'gold',
    },
    {
        title: 'Pagina de melhor amiga',
        description: 'Espaço para piadas internas, lembranças e frases que só vocês entendem.',
        tag: 'Amizade',
        icon: 'users',
        tone: 'olive',
    },
];

export const benefits: Benefit[] = [
    {
        title: 'Visual artesanal',
        description: 'Papel, fitas, recortes e detalhes de scrapbook com acabamento digital.',
        icon: 'sparkles',
    },
    {
        title: 'Templates prontos',
        description: 'Modelos para namoro, aniversário, melhor amiga e datas especiais.',
        icon: 'book',
    },
    {
        title: '100% personalizavel',
        description: 'Fotos, textos, cores e páginas para deixar o presente com a sua cara.',
        icon: 'pen',
    },
    {
        title: 'Música e memórias',
        description: 'Inclua a trilha que combina com a historia e com o momento.',
        icon: 'music',
    },
    {
        title: 'Link e QR Code',
        description: 'Envie pelo WhatsApp, coloque em um cartao ou entregue pessoalmente.',
        icon: 'qr',
    },
    {
        title: 'Feito para celular',
        description: 'A pessoa abre no celular e vive a experiência como um caderno digital.',
        icon: 'phone',
    },
    {
        title: 'Paginas interativas',
        description: 'Revelacoes, galerias, mapas e pequenas surpresas para explorar.',
        icon: 'image',
    },
    {
        title: 'Pronto em minutos',
        description: 'Comece por um template e monte um presente bonito sem saber editar.',
        icon: 'gift',
    },
];

export const testimonials: Testimonial[] = [
    {
        name: 'Livia M.',
        context: 'presente para namoro',
        quote: 'Fiz para minha namorada e ela chorou antes da terceira página.',
        initials: 'LM',
    },
    {
        name: 'Rafa C.',
        context: 'aniversário da melhor amiga',
        quote: 'Minha melhor amiga disse que foi o presente mais criativo que já recebeu.',
        initials: 'RC',
    },
    {
        name: 'Bianca A.',
        context: 'aniversário de namoro',
        quote: 'Parecia um caderno feito à mão, mas eu criei tudo pelo celular.',
        initials: 'BA',
    },
];

export const pricingBenefits = [
    'Link exclusivo para compartilhar',
    'Edicao depois de publicar',
    'QR Code incluso',
    'Templates personalizaveis',
    'Paginas com fotos e textos',
    'Visual pronto para emocionar',
];

export const faqs: FaqItem[] = [
    {
        question: 'Preciso saber editar?',
        answer: 'Nao. A ideia e partir de templates prontos e trocar textos, fotos e detalhes em poucos passos.',
    },
    {
        question: 'Como envio o presente?',
        answer: 'Voce recebe um link exclusivo e um QR Code. Da para enviar pelo WhatsApp ou colocar em um cartao fisico.',
    },
    {
        question: 'Posso editar depois?',
        answer: 'Sim. A proposta da v1 e permitir ajustes depois da publicacao, respeitando os limites do presente escolhido.',
    },
    {
        question: 'Funciona no celular?',
        answer: 'Sim. O scrapbook digital e pensado primeiro para celular, tanto para criar quanto para abrir o presente.',
    },
    {
        question: 'O presente tem música?',
        answer: 'Sim, o produto será preparado para adicionar uma música por metadata ou link permitido pelo provedor.',
    },
    {
        question: 'Posso escolher templates?',
        answer: 'Sim. A criação começa por templates de ocasiões como namoro, aniversário, melhor amiga e datas especiais.',
    },
    {
        question: 'O que é a demo interativa?',
        answer: 'É uma experiência pública para sentir como um scrapbook digital pode funcionar antes de criar o seu.',
    },
    {
        question: 'O presente fica no ar por quanto tempo?',
        answer: 'O tempo exato depende do plano escolhido. No início, a duração será clara antes do pagamento.',
    },
    {
        question: 'O QR Code está incluso?',
        answer: 'Sim. O QR Code faz parte da proposta comercial para facilitar uma entrega mais bonita e pessoal.',
    },
];
