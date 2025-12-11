import Alpine from 'alpinejs';

export { Alpine };

export function el(html = '<div></div>') {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const element = template.content.firstChild;
    document.body.appendChild(element);
    return element;
}

export function cleanup() {
    document.body.innerHTML = '';
}
