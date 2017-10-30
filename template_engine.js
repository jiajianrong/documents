// ---------
// test1
// ---------
var tpl_1 = "Hei, my name is <%=name%>, and I'm <%=info.age%> years old.";
var data_1 = {
    "name": "Barret Lee",
    "info": { "age": "20"}
};


// ---------
// test2
// ---------
var tpl_2 = '<ul><%for (var i=0;i<data.length;i++) { %> <li><%=data[i]%></li> <% } %> </ul>'
var data_2 = ['a', 'b', 'c']




console.log(template(tpl_1, data_1))





function buildSource(tpl) {
	var source = "var __p='';\n  __p+='"
	var cursor = 0

	tpl.replace(/<%([\s\S]+?)%>/g, function(all, matched, offset){
		
		source += escapes( tpl.slice(cursor, offset) )
		
		if (matched.trim().startsWith('=')) {
			source += "'+" + matched.substr(1) + "+'"
		} else {
			source += "';\n" + matched + "\n  __p+='"
		}
		
		cursor = offset + all.length
		
		return matched
	})

	source += tpl.slice(cursor) + "';\n return __p;";
	
	return source
}



function wrapFunc(source) {
	source =  'with(data||{}){\n ' + source + '}\n';
	return new Function('data', source)
}



function template(tpl, data) {
	var source = buildSource(tpl)
	var F = wrapFunc(source)
	
	return F(data)
}



function escapes(text) {

	var keys = {
		"'": "\\'",
		'\\': '\\\\',
		'\r': '\\r',
		'\n': '\\n',
		'\u2028': '\\u2028',
		'\u2029': '\\u2029'
	}
	
	var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g
	
	return text.replace( escapeRegExp, function(match) {
		return keys[match];
	} )
}



