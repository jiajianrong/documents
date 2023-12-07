let root = {
  type: 2,
  children: [
    {type: 1, title: 'title1'},
    {type: 1, title: 'title2'},
    {type: 2, children: [
      {type: 1, title: 'title3'}, {type: 1, title: 'title4'}
    ]},
  ]
};

function render(item) {
  if (item.type === 1) {
    return `<file title='${item.title}'>`
  } else {
    return `<dir>${item.children.map(render).join('')}</dir>`;
  }
}

let domStr = render(root);
console.log(domStr);
/*
<dir>
  <file title='title1'>
  <file title='title2'>
  <dir><file title='title3'><file title='title4'></dir>
</dir>
*/