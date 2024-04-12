"use strict";

$.fn.createListBrother_ = $.fn.createListBrother;
$.fn.createListBrother = function(_brotherId, _classes)
{
    var result = $('<div class="ui-control brother is-list-brother"/>');

    if (_classes !== undefined && _classes !== null && typeof(_classes) === 'string')
    {
        result.addClass(_classes);
    }

    // highlight layer
    var highlightLayer = $('<div class="highlight-layer"/>');
    result.append(highlightLayer);
    highlightLayer.createImage(Path.GFX + 'ui/skin/inventory_highlight.png', null, null, null);

    // image layer
    var imageLayer = $('<div class="image-layer"/>');
    result.append(imageLayer);

    /*imageLayer.createImage(null, function (_image)
    {
        var data = result.data('brother');
        _image.removeClass('display-none').addClass('display-block');
        //_image.centerImageWithinParent(data.imageOffsetX, data.imageOffsetY, data.imageScale);
    }, null, 'display-none');*/

    imageLayer.createImage(null, null, null, '');

    // lock layer
    var lockLayer = $('<div class="lock-layer"/>');
    result.append(lockLayer);
    lockLayer.createImage(null, function (_image)
    {
        _image.removeClass('display-none').addClass('display-block');
    }, null, 'display-none');

 	// mood layer
    var moodLayer = $('<div class="mood-layer"/>');
    result.append(moodLayer);
    moodLayer.createImage(null, function (_image)
    {
    	_image.removeClass('display-none').addClass('display-block');
    }, null, 'display-none');

    // helmet layer
    var helmetLayer = $('<div class="helmet-layer"/>');
    result.append(helmetLayer);
    helmetLayer.createImage(null, function (_image)
    {
    	_image.removeClass('display-none').addClass('display-block');
    }, null, 'display-none');

    // armor layer
    var armorLayer = $('<div class="armor-layer"/>');
    result.append(armorLayer);
    armorLayer.createImage(null, function (_image)
    {
    	_image.removeClass('display-none').addClass('display-block');
    }, null, 'display-none');

    // asset layer
    var assetLayer = $('<div class="asset-layer"/>');
    result.append(assetLayer);
    
    var statusContainer = $('<div class="primary-status-container"/>');
    assetLayer.append(statusContainer);

    var statusContainer = $('<div class="status-container"/>');
    assetLayer.append(statusContainer);
          
    // add data
    var data = this.data('brother') || {};
    data.id = _brotherId || 0;
    data.imageOffsetX = 0;
    data.imageOffsetY = 0;
    data.imageScale = 0;

    result.data('brother', data);

    result.bindTooltip({ contentType: 'roster-entity', entityId: _brotherId });

    this.append(result);

    return result;
}



$.fn.showListBrotherHelmetImage = function (_value, _image)
{
	var moodLayer = this.find('.helmet-layer:first');
	if(moodLayer.length > 0)
	{
		var image = moodLayer.find('img:first');

		if (_image !== undefined && _image != "")
			image.attr('src', Path.GFX + _image);

		if(_value === true && _image != "")
		{
			moodLayer.removeClass('display-none').addClass('display-block');
		}
		else
		{
			moodLayer.removeClass('display-block').addClass('display-none');
		}
	}
};

$.fn.showListBrotherArmorImage = function (_value, _image)
{
	var moodLayer = this.find('.armor-layer:first');
	if(moodLayer.length > 0)
	{
		var image = moodLayer.find('img:first');

		if (_image !== undefined&& _image != "")
			image.attr('src', Path.GFX + _image);

		if(_value === true && _image != "")
		{
			moodLayer.removeClass('display-none').addClass('display-block');
		}
		else
		{
			moodLayer.removeClass('display-block').addClass('display-none');
		}
	}
};



CharacterScreenBrothersListModule.prototype.addBrotherSlotDIV_ = CharacterScreenBrothersListModule.prototype.addBrotherSlotDIV;
CharacterScreenBrothersListModule.prototype.addBrotherSlotDIV = function (_parentDiv, _data, _index, _allowReordering)
{
    var self = this;
    var screen = $('.character-screen');

    // create: slot & background layer
    var result = _parentDiv.createListBrother(_data[CharacterScreenIdentifier.Entity.Id]);
    result.attr('id', 'slot-index_' + _data[CharacterScreenIdentifier.Entity.Id]);
    result.data('ID', _data[CharacterScreenIdentifier.Entity.Id]);
    result.data('idx', _index);

    this.mSlots[_index].data('child', result);

    if (_index <= 17)
        ++this.mNumActive;

    // drag handler
    if (_allowReordering)
    {
        result.drag("start", function (ev, dd)
        {
            // build proxy
            var proxy = $('<div class="ui-control brother is-proxy"/>');
            proxy.appendTo(document.body);
            proxy.data('idx', _index);

            var imageLayer = result.find('.image-layer:first');
            if (imageLayer.length > 0)
            {
                imageLayer = imageLayer.clone();
                proxy.append(imageLayer);
            }

            $(dd.drag).addClass('is-dragged');

            return proxy;
        }, { distance: 3 });

        result.drag(function (ev, dd)
        {
            $(dd.proxy).css({ top: dd.offsetY, left: dd.offsetX });
        }, { relative: false, distance: 3 });

        result.drag("end", function (ev, dd)
        {
            var drag = $(dd.drag);
            var drop = $(dd.drop);
            var proxy = $(dd.proxy);

            var allowDragEnd = true; // TODO: check what we're dropping onto

            // not dropped into anything?
            if (drop.length === 0 || allowDragEnd === false)
            {
                proxy.velocity("finish", true).velocity({ top: dd.originalY, left: dd.originalX },
			    {
			        duration: 300,
			        complete: function ()
			        {
			            proxy.remove();
			            drag.removeClass('is-dragged');
			        }
			    });
            }
            else
            {
                proxy.remove();
            }
        }, { drop: '.is-brother-slot' });
    }

    // update image & name
    var character = _data[CharacterScreenIdentifier.Entity.Character.Key];
    var imageOffsetX = (CharacterScreenIdentifier.Entity.Character.ImageOffsetX in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetX] : 0);
    var imageOffsetY = (CharacterScreenIdentifier.Entity.Character.ImageOffsetY in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetY] : 0);

    result.assignListBrotherImage(Path.PROCEDURAL + character[CharacterScreenIdentifier.Entity.Character.ImagePath], imageOffsetX, imageOffsetY, 0.66);

    if(CharacterScreenIdentifier.Entity.Character.LeveledUp in character && character[CharacterScreenIdentifier.Entity.Character.LeveledUp] === true)
    {
        result.assignListBrotherLeveledUp();
    }
    if('moodIcon' in character && this.mDataSource.getInventoryMode() == CharacterScreenDatasourceIdentifier.InventoryMode.Stash)
    {
    	result.showListBrotherMoodImage(this.IsMoodVisible, character['moodIcon']);
    }

    if('armorIcon' in character && this.mDataSource.getInventoryMode() == CharacterScreenDatasourceIdentifier.InventoryMode.Stash)
    {
    	result.showListBrotherArmorImage(this.IsMoodVisible, character['armorIcon']);
    }

    if('helmetIcon' in character && this.mDataSource.getInventoryMode() == CharacterScreenDatasourceIdentifier.InventoryMode.Stash)
    {
    	result.showListBrotherHelmetImage(this.IsMoodVisible, character['helmetIcon']);
    }

    for(var i = 0; i != _data['injuries'].length && i < 3; ++i)
    {
        result.assignListBrotherStatusEffect(_data['injuries'][i].imagePath, _data[CharacterScreenIdentifier.Entity.Id], _data['injuries'][i].id)
    }

    if(_data['injuries'].length <= 2 && _data['stats'].hitpoints < _data['stats'].hitpointsMax)
    {
    	result.assignListBrotherDaysWounded();
    }

    result.assignListBrotherClickHandler(function (_brother, _event)
	{
        var data = _brother.data('brother');
        self.mDataSource.selectedBrotherById(data.id);
    });
};


CharacterScreenBrothersListModule.prototype.updateBrotherSlot_ = CharacterScreenBrothersListModule.prototype.updateBrotherSlot;
CharacterScreenBrothersListModule.prototype.updateBrotherSlot = function (_data)
{
	var slot = this.mListScrollContainer.find('#slot-index_' + _data[CharacterScreenIdentifier.Entity.Id] + ':first');
	if (slot.length === 0)
	{
		return;
	}
    
    if(this.mDataSource.getInventoryMode() == CharacterScreenDatasourceIdentifier.InventoryMode.Stash)
    {
        var character = _data[CharacterScreenIdentifier.Entity.Character.Key];
        slot.showListBrotherArmorImage(this.IsMoodVisible, character['armorIcon']);
        slot.showListBrotherHelmetImage(this.IsMoodVisible, character['helmetIcon']);
    }

    this.updateBrotherSlot_(_data);

};


TacticalScreenTopbarEventLogModule.prototype.create_ = TacticalScreenTopbarEventLogModule.prototype.create;
TacticalScreenTopbarEventLogModule.prototype.create = function(_parentDiv)
{
	this.mMaxVisibleEntries = 100;
    this.mNormalHeight = '7.0rem';
    this.create_(_parentDiv);   
}