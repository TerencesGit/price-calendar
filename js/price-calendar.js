//价格日历插件
(function($){
	var PriceCalendar = function(config){
		this.config = {
			calendarWrap: {},
			data: [],
		};
		this.handlers = {};
		this.config = config;
		$.extend(this.config, config)
		this.init()
	}
	PriceCalendar.prototype = {
		init: function(){
			var self = this;
			var dataArr = this.config.data;
			var currDate = new Date(dataArr[0].Date);
			this.calendar = {
				year: currDate.getFullYear(),
				month: currDate.getMonth() + 1,
			}
			this.selectedDate;
			this.getWeek = function(date){
				var year = this.calendar.year,
						month = this.calendar.month - 1;
				return new Date(year, month, 1).getDay();
			}
			this.getMonthDays = function(date){
				var year = this.calendar.year,
						month = this.calendar.month;
				var nextDate = new Date(year, month, 1);		
				return new Date(nextDate.getTime() - 1000 * 60 * 60 * 24).getDate();
			}
			this.getLastMonth = function(){
				if(self.calendar.month <= 1){
					self.calendar.year -= 1;
					self.calendar.month = 12;
				}else{
					self.calendar.month -= 1;
				}
			}
			this.getNextMonth = function(){
				if(self.calendar.month > 11){
					self.calendar.year += 1;
					self.calendar.month = 1;
				}else{
					self.calendar.month += 1;
				}
			}
			this.getDateRange = function(){
				var start_date = new Date(dataArr[0].Date);
				var end_date = new Date(dataArr[dataArr.length - 1].Date);
				var DateRange = {
					start_year: start_date.getFullYear(),
					start_month: start_date.getMonth() + 1,
					end_year: end_date.getFullYear(),
					end_month: end_date.getMonth() + 1,
				}
				return DateRange;
			}
			this.getData = function(date){
				for(let i = 0; i < dataArr.length; i++){
					if(dataArr[i].Date === date){
						return dataArr[i];
					}
				}
			}
			this.filled = function(n){
				return String(n).replace(/^(\d)$/, '0$1');
			}
			this.rendUI()
			this.bindUI()
		},
		rendUI: function(){
			var self = this;
			var calendarHtml = '<table id="price_calendar" class="price-calendar-table">';
			var calendarThead = '<thead class="price-calendar-thead"><tr class="price-calendar-month"><th>\
													  <a href="javascript:;" class="last-month">&lt;</a></th>\
													  <th colspan="5">'+ this.calendar.year+'年'+this.calendar.month+'月'+'</th>\
													  <th><a href="javascript:;" class="next-month">&gt;</a></th></tr>\
														<tr class="price-calendar-week"><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th>\
														<th>五</th><th>六</th></tr></thead>'
			calendarHtml += calendarThead;
			var weekDay = this.getWeek()
			var monthDays= this.getMonthDays()
			var totalCell = (Math.ceil((monthDays - (7 - weekDay)) / 7) + 1) * 7;
			var cells = 0;
			var calendarTbody = '<tbody class="price-calendar-tbody"><tr>';
			for(let i = 1; i <= totalCell; i++){
				var _day = i - weekDay;
				if(i > weekDay && _day <= monthDays){
					var _today = self.calendar.year+'-'+self.filled(self.calendar.month)+'-'+self.filled(_day);
					var data = self.getData(_today);
					var tdHtml;
					if(data){
						var status = parseInt(data.Remain) > 0 ? 'on' : 'disabled';
						tdHtml = '<td><div class="date-cell '+status+'" data-date="'+_today+'">\
											<span>'+_day+'</span>\
											<span class="remain">余'+data.Remain+'人</span>\
											<span class="price">￥'+data.Price+'</span></div></td>';
					}else{
						tdHtml = '<td><div class="date-cell"><span>'+_day+'</span></div></td>'
					}
					calendarTbody += tdHtml;
				}else{
					calendarTbody += '<td class="disabled"></td>';
				}
				if(cells == 6){
					calendarTbody += '</tr><tr>';
					cells = -1;
				}
				cells += 1;
			}
			calendarTbody += '</tr></tbody>';
			calendarHtml += calendarTbody;
			calendarHtml += '</table>';
			this.calendarTable = $(calendarHtml);
			var calendarWrap = $(this.config.calendarWrap);
			calendarWrap.children('#price_calendar').length === 1 && 
			calendarWrap.children('#price_calendar').remove()
			this.calendarTable.appendTo(calendarWrap)
			this.lastMonthBtn = this.calendarTable.find('.last-month');
			this.nextMonthBtn = this.calendarTable.find('.next-month');
			this.dateCell = this.calendarTable.find('.date-cell.on');
			if(self.selectedDate){
					this.dateCell.each(function(k, v){
					if($(v).data('date') == self.selectedDate){
						$(v).addClass('selected')
					}
				})
			}
			var DateRange = this.getDateRange();
			this.calendar.year < DateRange.start_year ||
			(this.calendar.year == DateRange.start_year && this.calendar.month <= DateRange.start_month) &&
			this.lastMonthBtn.hide()
			this.calendar.year > DateRange.end_year || 
			(this.calendar.year == DateRange.end_year && this.calendar.month >= DateRange.end_month) && 
			this.nextMonthBtn.hide()
		}, 
		bindUI: function(){
			var self = this;
			this.lastMonthBtn.on('click', function(){
				var DateRange = self.getDateRange();
				if(self.calendar.year < DateRange.start_year || (self.calendar.year == DateRange.start_year && self.calendar.month <= DateRange.start_month)){
					 return false;
				}else{
					self.getLastMonth();
					self.rendUI()
					self.bindUI()
				}
			})
			this.nextMonthBtn.on('click', function(){
				var DateRange = self.getDateRange();
				if(self.calendar.year > DateRange.end_year || self.calendar.year == DateRange.end_year && self.calendar.month >= DateRange.end_month){
					return false;
				}else{
					self.getNextMonth();
					self.rendUI();
					self.bindUI();
				}
			})
			this.calendarTable.delegate('.date-cell.on', 'click', function(){
				self.calendarTable.find('.selected').removeClass('selected');
				$(this).addClass('selected');
				self.selectedDate = $(this).data('date');
				self.fire('selected', self.getData($(this).data('date')))
			})
		},
		update: function(date){
			var self = this;
			this.calendar.year = date.getFullYear()
			this.calendar.month = date.getMonth() + 1;
			this.selectedDate = this.calendar.year+'-'+filled(this.calendar.month)+
												'-'+this.filled(date.getDate());
			this.rendUI();
			this.bindUI();
			this.calendarTable.find('.date-cell.on').each(function(k, v){
				if($(v).data('date') == self.selectedDate){
					$(v).click()
				}
			})
		},
		on: function(type, handler){
			if(typeof this.handlers[type] == 'undefined'){
				this.handlers[type] = [];
			}
			this.handlers[type].push(handler);
			return this;
		},
		fire: function(type, data){
			if(this.handlers[type] instanceof Array){
				var handlers = this.handlers[type];
				for(var i = 0,len = handlers.length;i<len;i++){
					handlers[i](data);
				}
			}
		},
	}
	window.PriceCalendar = PriceCalendar;
})(jQuery)