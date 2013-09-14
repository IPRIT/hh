var ObjectStorage = function ObjectStorage(name, duration) {
	var self,
		name = name || '_objectStorage',
		defaultDuration = 1000;
	if (ObjectStorage.instances[name]) {
		self = ObjectStorage.instances[name];
		self.duration = duration || self.duration;
	} else {
		self = this;
		self._name = name;
		self.duration = duration || defaultDuration;
		self._init();
		ObjectStorage.instances[name] = self;
	}
	
	return self; 
};

ObjectStorage.instances = {};
ObjectStorage.prototype = {
	_save: function(type) {
		var stringified = JSON.stringify(this[type]),
			storage = window[type + 'Storage'];
		if (storage.getItem(this._name) !== stringified) {
			storage.setItem(this._name, stringified);
		}
	},

	_get: function(type) {
		this[type] = JSON.parse(window[type + 'Storage'].getItem(this._name) ) || {};
	},

	_init: function() {
		var self = this;
		self._get('local');
		self._get('session');

		(function callee() {
			self.timeoutId = setTimeout(function() {
				self._save('local');
				callee();
			}, self._duration);
		})();

		window.addEventListener('beforeunload', function() {
			self._save('local');
			self._save('session');
		});
	},
	
	timeoutId: null,
	local: {},
	session: {}
};


var Calendar = {
	make: function() {
		this.clear();
		this.initialize();
		for (var i = 1; i <= 42; i++) {
			var el = document.getElementById('el'+i);
			el.childNodes[1].innerHTML = this.array_days[i-1];
		}
		
		for (var i = 1, j = this.first_day_month; i <= this.max_days_in_month(); i++)
		{
			var el = document.getElementById('el'+j++);
			el.parentNode.parentNode.style.cursor = 'pointer';
			var cont = el.childNodes[3];
			var text = '';
			var data = this.dataSearch(i, this.current_month_n + 1, this.current_year);
			if (data.d !== undefined)
			{
				var text = '<b>' + data.header + '</b><br>' + data.members + '<br><br>' + data.text;
				el.parentNode.parentNode.style.backgroundColor = '#c2e4fe';
				cont.style.color = '#777';
			} else {
				if ((this.current_day == i) && (new Date().getMonth() == this.current_month_n) && (new Date().getFullYear() == this.current_year)){
					el.parentNode.parentNode.style.backgroundColor = '#f4f4f4';
				} else {
					el.parentNode.parentNode.style.backgroundColor = '';	
				}
			}
			cont.innerHTML = text;
		}
		this.insertDaysName();
	},
	
	insertDaysName: function() {
		var days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
		for (var i = 1; i <= 7; i++) {
			var el = document.getElementById('el'+i);
			el.getElementsByTagName('div')[0].innerHTML = days[i-1] + ', ' + el.getElementsByTagName('div')[0].innerHTML;
		}
	},
	
	clear: function() {
		for (var i = 1; i <= 42; i++) {
			var el = document.getElementById('el'+i);
			el.getElementsByTagName('div')[1].innerHTML = '';
			var parent = el.parentNode.parentNode;
			parent.style.backgroundColor = '';
			parent.style.cursor = '';
		}
	},
	
	actPrevMonth: function() {
		this.setPrevMonth();
		this.make();
		this.refreshCur();
		this.closeWindow();
	},
	
	actNextMonth: function() {
		this.setNextMonth();
		this.make();
		this.refreshCur();
		this.closeWindow();	
	},
	
	refreshCur: function() {
		document.getElementById('cur_date').innerHTML = this.current_month_rus(this.current_month_n) + ' ' + this.current_year;
	},
	
	refresh: function() {
		window.location.href = window.location.href;
	},
	
	actCurrentMonth: function() {
		this.current_month_n = new Date().getMonth();
		this.current_year = new Date().getFullYear();
		this.make();
		this.refreshCur();
		this.closeWindow();
	},
	
	array_days: [],
	first_day_month: null,
	first_day: null,
	initialize: function() {
		this.array_days = [];
		var day = new Date(this.current_year, this.current_month_n, 1).getDay();
		day = (day == 0) ? 7 : day;
		if (day != 1)
		{
			var max_days_prev_month = 32 - new Date(this.current_year, this.prev_month(), 32).getDate();
			var first_day = max_days_prev_month - day + 2;
			var cur_day = first_day;
			for (var i = 0; i <= max_days_prev_month - first_day; i++)
			{
				this.array_days[i] = cur_day++;
			}
		}
		
		var cur_day = 1;
		this.first_day_month = this.array_days.length+1;
		
		for (var i = 1; i <= this.max_days_in_month(); i++)
		{
			this.array_days[this.array_days.length] = i;
		}
		var k = 42 - this.array_days.length;
		for (var i = 1; i <= k; i++)
		{
			this.array_days[this.array_days.length] = i;
		}
	},
	
	current_day: new Date().getDate(),
	
	current_month_n: new Date().getMonth(),
	
	current_month_rus: function(month) {
		var m;
		switch(month) {
			case 0: 
				m = 'Январь';
				break;
			case 1: 
				m = 'Февраль';
				break;
			case 2: 
				m = 'Март';
				break;
			case 3: 
				m = 'Апрель';
				break;
			case 4: 
				m = 'Май';
				break;
			case 5: 
				m = 'Июнь';
				break;
			case 6: 
				m = 'Июль';
				break;
			case 7: 
				m = 'Август';
				break;
			case 8: 
				m = 'Сентябрь';
				break;
			case 9: 
				m = 'Октябрь';
				break;
			case 10: 
				m = 'Ноябрь';
				break;
			case 11: 
				m = 'Декабрь';
				break;
			default:
				m = false;
				break;
		}
		return m;
	},
	
	current_year: new Date().getFullYear(),
	
	max_days_in_month: function() { 
		return 32 - new Date(this.current_year, this.current_month_n, 32).getDate(); 
	},
	
	prev_month: function() {
		return (this.current_month_n - 1 == -1) ? 11 : this.current_month_n - 1;
	},
	
	next_month: function() {
		return (this.current_month_n + 1 == 12) ? 0 : this.current_month_n + 1;
	},
	
	setPrevMonth: function() {
		if (this.current_month_n - 1 == -1) {
			this.current_month_n = 11;
			this.current_year -= 1;
		} else {
			this.current_month_n -= 1;
		}
	},
	
	setNextMonth: function() {
		if (this.current_month_n + 1 == 12) {
			this.current_month_n = 0;
			this.current_year += 1;
		} else {
			this.current_month_n += 1;
		}
	},
	
	st: function() {
		var st = new ObjectStorage;
		//st.local = {};
		return st.local;
	},
	
	dataSearch: function(day, month, year) {
		var st = this.st();
		if (typeof st.d === 'undefined')
		{
			st.d = [];
			st.m = [];	
			st.y = [];	
			st.header = [];	
			st.members = [];	
			st.text = [];
		}
		var data = {};
		for (var i = 0; i < st.d.length; i++)
		{
			if ((st.d[i] == day) && (st.m[i] == month) && (st.y[i] == year))
			{
				for (var key in st)
				{
					data[key] = st[key][i];
				}
			}
		}
		return data;
	},
	
	addEvent: function() {
		var args = Array.prototype.slice.call(arguments);
		var st = this.st();
		if (typeof st.m === 'undefined')
		{
			st.d = [];
			st.m = [];	
			st.y = [];	
			st.header = [];	
			st.members = [];	
			st.text = [];
		}
		if (args[0].d != '' && args[0].m != '' && args[0].y != '') {
			for (var key in st)
				st[key][st[key].length] = args[0][key];	
		}
	},
	
	removeEvent: function (d, m, y) {
		var st = this.st();
		if (typeof st.d === 'undefined')
		{
			st.d = [];
			st.m = [];	
			st.y = [];	
			st.header = [];	
			st.members = [];	
			st.text = [];
		}
		
		for (var i = 0; i < st.d.length; i++)
		{
			if ((st.d[i] == d) && (st.m[i] == m) && (st.y[i] == y))
			{
				for (var key in st)
				{
					st[key].splice(i, 1);
				}
			}
		}
	},
	
	actNewEvent: function() {
		var text = document.getElementById('new_event_text');
		var arr = text.value.split(',');
		var date = arr[0].split(' ');
		var event_info = {d: date[0], m: this.convertMonthStrToInt(date[1]), y: date[2], header: (arr[1] !== undefined)?arr[1]:"Без названия", members: (arr[2] !== undefined)?arr[2]:"&nbsp;", text: (arr[3] !== undefined)?arr[3]:"&nbsp;"};
		this.addEvent(event_info);
		text.value = '';
		this.hWindow();
		this.make();
	},
	
	convertMonthStrToInt: function(month) {
		var n = 0;
		switch(month)
		{
			case 'января': 
				n = 1;
				break;
			case 'февраля': 
				n = 2;
				break;
			case 'марта': 
				n = 3;
				break;
			case 'апреля': 
				n = 4;
				break;
			case 'мая': 
				n = 5;
				break;
			case 'июня': 
				n = 6;
				break;
			case 'июля': 
				n = 7;
				break;
			case 'августа': 
				n = 8;
				break;
			case 'сентября': 
				n = 9;
				break;
			case 'октября': 
				n = 10;
				break;
			case 'ноября': 
				n = 11;
				break;
			case 'декабря': 
				n = 12;
				break;
		}
		return n;
	},
	
	hWindow: function() {
		var btn = document.getElementById('new_event');
		var el = document.getElementById('new_event_layer');
		if (el.style.display == 'none') {
			btn.className = 'input_btn_active';
			el.style.display = 'block';
			document.getElementById('new_event_text').focus();
		} else {
			el.style.display = 'none';	
			btn.className = 'input_btn';
		}
	},
	
	search: function(input) {
		var text = input.value;
		if (text.length != 0) {
			document.getElementById('reset').style.display = 'block';
		} else {
			document.getElementById('reset').style.display = 'none';
		}
		text = text.replace(/\,/i, ' ');
		var arr = text.split(' ');
		var st = this.st();
		if (typeof st.d === 'undefined')
		{
			st.d = [];
			st.m = [];	
			st.y = [];	
			st.header = [];	
			st.members = [];	
			st.text = [];
		}
		var data = {};
		for (var i = 0; i < st.d.length; i++)
		{
			for (var key in st)
			{
				for (var j = 0; j < arr.length; j++)
				{
					if (typeof data.d === 'undefined')
					{
						data.d = [];
						data.m = [];	
						data.y = [];	
						data.header = [];
						data.m_r = [];
					}
					
					var pattern = arr[j];
					if (pattern != "")
					{
						if (new RegExp(pattern, "i").test(st[key][i])) {
							var length = data.d.length;
							data.d[length] = st.d[i];
							data.m[length] = st.m[i];
							data.m_r[length] = this.current_month_rus(st.m[i]-1);
							data.y[length] = st.y[i];
							data.header[length] = st.header[i];
						}
					}
				}
			}
		}
		
		data = this.removeDuplicate(data);
		var inner = '';
		if (data.d.length != 0) {
			document.getElementById('search_tab').style.display = 'block';
			for (var i = 0; i < data.d.length; i++)
			{
				inner += '<div class="find_el" onclick="Calendar.turnEvent('+data.m[i]+', '+data.y[i]+')"><span class="event_header">' + data.header[i] + '</span><br><span style="font-size: 12px;">' + data.d[i] + ' ' + data.m_r[i] + ' ' + data.y[i] + '</span></div>';
			}
			document.getElementById('find_elements').innerHTML = inner;
		} else {
			document.getElementById('search_tab').style.display = 'none';	
		}
	},
	
	turnEvent: function(month, year) {
		this.current_year = year;
		this.current_month_n = month-1;
		this.make();
		document.getElementById('search').value = '';
		document.getElementById('search_tab').style.display = 'none';
		this.refreshCur();
		this.search(document.getElementById('search'));
	},
	
	removeDuplicate: function(data) {
		var length = data.d.length;
		for (var j = 0; j < length; j++)
		{
			for (var i = 1; i < length; i++) {
				if (data.d[i] == data.d[i-1] && data.m[i] == data.m[i-1] && data.y[i] == data.y[i-1]) {
					for (var key in data) {
						data[key].splice(i, 1);
					}
					break;
				}
			}
		}
		return data;
	},
	
	resetSearch: function() {
		var inp = document.getElementById('search');
		inp.value = '';
		this.search(inp);
	},
	
	element: function(number) {
		if (this.cur_pos != null) {
			var el = document.getElementById('el'+this.cur_pos);
			el.parentNode.parentNode.style.backgroundColor = '';
			el.parentNode.style.boxShadow = '';
			this.make();
		}
		this.cur_pos = number;
		if ((this.cur_pos >= this.first_day_month) && (this.cur_pos <= this.first_day_month + this.max_days_in_month() - 1))
		{
			this.pickElement();
			var popup = document.getElementById('popup');
			if ((this.cur_pos % 7) > 4 || (this.cur_pos % 7) == 0) {
				popup.getElementsByTagName('div')[0].className = 'arrow_right';
				popup.className = 'popup popup_m_r';
			} else {
				popup.getElementsByTagName('div')[0].className = 'arrow_left';
				popup.className = 'popup popup_m_l';
			}
			document.getElementById('el'+this.cur_pos).parentNode.parentNode.appendChild(popup);
			var data = this.dataSearch(this.array_days[this.cur_pos-1], this.current_month_n+1, this.current_year);
			if (data.d !== undefined)
			{
				var inputs = popup.getElementsByTagName('div')[2].getElementsByTagName('input');
				inputs[0].value = data.header;
				ch_event(inputs[0]);
				inputs[1].value = (data.members == "&nbsp;") ? '' : data.members;
				ch_members(inputs[1]);
				var textarea = document.getElementById('discription');
				textarea.value = (data.text == "&nbsp;") ? '' : data.text;
				ch_text(textarea);
			} else {
				var inputs = popup.getElementsByTagName('div')[2].getElementsByTagName('input');
				setTimeout(function() {unch_event(inputs[0])}, 10);
				unch_members(inputs[1]);
				inputs[0].value = '';
				inputs[1].value = '';
				var textarea = document.getElementById('discription');
				unch_text(textarea);
				textarea.value = '';
			}
			var date = document.getElementById('popup_date');
				date.innerHTML = this.array_days[this.cur_pos-1] +' '+ this.current_month_rus(this.current_month_n) + ' ' + this.current_year;
			popup.style.display = 'block';
			document.getElementById('popup_event').focus();
		}
	},
	
	cur_pos: null,
	
	pickElement: function() {
		var el = document.getElementById('el'+this.cur_pos);
		el.parentNode.parentNode.style.backgroundColor = '#e5f1f9'; //86c9fd
		el.parentNode.style.boxShadow = 'inset 0px 0px 0px 2px #86c9fd';
	},
	
	closeWindow: function() {
		document.getElementById('popup').style.display = 'none';
		if (this.cur_pos != null) {
			var el = document.getElementById('el'+this.cur_pos);
			el.parentNode.parentNode.style.backgroundColor = '';
			el.parentNode.style.boxShadow = '';
		}
		this.make();
	},
	
	popupAdd: function() {
		var data = {};
		data.header = (document.getElementById('popup_event').value == '') ? 'Без названия' : document.getElementById('popup_event').value;
		data.d = this.array_days[this.cur_pos-1];
		data.m = this.current_month_n+1;
		data.y = this.current_year;
		data.members = document.getElementById('popup_members').value;
		data.text = document.getElementById('discription').value;
		this.removeEvent(data.d, data.m, data.y);
		this.addEvent(data);
		this.closeWindow();
		this.make();
	},
	
	popupRemove: function() {
		this.removeEvent(this.array_days[this.cur_pos-1], this.current_month_n+1, this.current_year)
		this.closeWindow();
		this.make();
	}
	
	
}

function start() {
	Calendar.make();
}

function ch_members(inp) {
	if (inp.value.length != 0) {
		var div = inp.nextSibling.nextSibling;
		div.innerHTML = '<span style="color: #777; font-weight: 600; font-size: 12px;">Участники:</span><br><span style="color: #000; font-size: 14px;">'+inp.value+'</span>';
		div.style.display = 'block';
		inp.style.display = 'none';
	}
}

function unch_event(inp) {
	var div = inp.nextSibling.nextSibling;
	div.innerHTML = '';
	div.style.display = 'none';
	inp.style.display = '';
	inp.focus();
}

function unch_members(inp) {
	var div = inp.nextSibling.nextSibling;
	div.innerHTML = '';
	div.style.display = 'none';
	inp.style.display = '';
	inp.focus();
}

function ch_event(inp) {
	if (inp.value.length != 0) {
		var div = inp.nextSibling.nextSibling;
		div.innerHTML = inp.value;
		div.style.display = 'block';
		inp.style.display = 'none';
	}
}

function ch_text(inp) {
	if (inp.value.length != 0) {
		var div = inp.nextSibling.nextSibling;
		div.innerHTML = '<span style="color: #777; font-weight: 600; font-size: 12px;">Описание:</span><br><span style="color: #000; font-size: 14px;">'+inp.value+'</span>';
		div.style.display = 'block';
		inp.style.display = 'none';
	}
}

function unch_text(inp) {
	var div = inp.nextSibling.nextSibling;
	div.innerHTML = '';
	div.style.display = 'none';
	inp.style.display = '';
	inp.focus();
}
