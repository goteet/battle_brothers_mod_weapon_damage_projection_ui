::mods_registerMod("mod_weapon_damage_projection_ui", 1, "Display Weapon Damage in UI.");

::mods_queue("mod_weapon_damage_projection_ui", null, function() 
{
	//
	// Weapon Damage Details
	//
	::mods_hookChildren("items/weapons/weapon", function(weapon) {
		local getTooltip = ::mods_getMember(weapon, "getTooltip");
		local getTooltip_ = function()
		{
			local toolTips = getTooltip();
			foreach(object in toolTips)
			{
				if(object.id == 64 || object.id == 5)
				{
					local s = object.text.find("%");
					if (s != null)
					{
						local percent = object.id == 5 ? this.m.ArmorDamageMult : (this.m.DirectDamageMult + this.m.DirectDamageAdd);
						local min = this.Math.floor(this.m.RegularDamage * percent);
						local max =  this.Math.floor(this.m.RegularDamageMax * percent);
						local desc = " (" + min + "-"+ max + ")"
						object.text = object.text.slice(0, s + 1)
										+ desc
										+ object.text.slice(s + 1);
					}
				}
			}
			return toolTips;
		};
		::mods_override(weapon, "getTooltip", getTooltip_);
	});


	//
	// Skill Damage Details
	//
	local change_direct_damage_min_desc = function(toolTips)
	{
		foreach(object in toolTips)
		{
			if(object.id == 4)
			{
				local index = object.text.find("]0[");
				if (index != null)
				{
					local p = this.m.Container.buildPropertiesForUse(this, null);
					local damage_regular_min = this.Math.floor(p.DamageRegularMin * p.DamageRegularMult * p.DamageTotalMult * (this.m.IsRanged ? p.RangedDamageMult : p.MeleeDamageMult) * p.DamageTooltipMinMult);
					local damage_direct_min = this.Math.floor(damage_regular_min * this.Math.minf(1.0, p.DamageDirectMult * (this.m.DirectDamageMult + p.DamageDirectAdd + (this.m.IsRanged ? p.DamageDirectRangedAdd : p.DamageDirectMeleeAdd))));
					object.text = object.text.slice(0, index + 1)
									+ "0/" + damage_direct_min
									+ object.text.slice(index + 2);

				}
			}
		}
	}

	::mods_hookChildren("skills/skill", function(skill) {
		local getDefaultTooltip = ::mods_getMember(skill, "getDefaultTooltip");
		local getDefaultTooltip_ = function()
		{
			local toolTips = getDefaultTooltip();
			change_direct_damage_min_desc(toolTips);
			return toolTips;
		};
		::mods_override(skill, "getDefaultTooltip", getDefaultTooltip_);
	});

	local skill_hook_function = function(skill) {
		local getTooltip = ::mods_getMember(skill, "getTooltip");
		local getTooltip_ = function()
		{
			local toolTips = getTooltip();
			change_direct_damage_min_desc(toolTips);
			return toolTips;
		};
		::mods_override(skill, "getTooltip", getTooltip_);
	};

	::mods_hookNewObject("skills/actives/decapitate", skill_hook_function);
	::mods_hookNewObject("skills/actives/overhead_strike", skill_hook_function);
	::mods_hookNewObject("skills/actives/pound", skill_hook_function);
	::mods_hookNewObject("skills/actives/smite_skill", skill_hook_function);
	::mods_hookNewObject("skills/actives/split_man", skill_hook_function);

	
	::mods_hookNewObject("ui/screens/tooltip/tooltip_events", function ( events )
	{
		local tactical_queryTileTooltipData = ::mods_getMember(events, "tactical_queryTileTooltipData");
		::mods_override(events, "tactical_queryTileTooltipData", function()
		{
			local r = tactical_queryTileTooltipData();
			if( r != null )
			{
				local lastTileHovered = this.Tactical.State.getLastTileHovered();
				local CoordinateDesc = "Position=(" + lastTileHovered.Coords.X + ", " + lastTileHovered.Coords.Y +")";
				local actor = this.Tactical.TurnSequenceBar.getActiveEntity();
				if (actor != null)
				{
					local tile = actor.getTile();
					CoordinateDesc += ", Distance=" + lastTileHovered.getDistanceTo(tile);

					local direction8 = tile.getDirection8To(lastTileHovered);
					local direction  = tile.getDirectionTo(lastTileHovered);
					r.push(
					{
						id = 91,
						type = "text",
						text = "Direction = " + this.Const.Strings.Direction[direction] + ", D8 = " + this.Const.Strings.Direction8[direction8]
					});
				}

				r.push({ id = 92, type = "text", text = CoordinateDesc });
			}
			return r;
		});

	});
	
});