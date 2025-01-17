var PadClipLauncher = new PadMode();

var ClipBanks = {
  Bank_A: 0x01,
  Bank_B: 0x02,
  Bank_C: 0x03,
  Bank_D: 0x04
};


PadClipLauncher.init = function() {
  if (displayHelpText) {
    if (activeClipBank == ClipBanks.Bank_A) host.showPopupNotification("Pads: Clip Launch: 1 - 4");
    else if (activeClipBank == ClipBanks.Bank_B) host.showPopupNotification("Pads: Clip Launch: 5 - 8");
    else if (activeClipBank == ClipBanks.Bank_C) host.showPopupNotification("Pads: Clip Launch: 9 - 12");
    else host.showPopupNotification("Pads: Clip Launch: 13 - 16");
  }
  PadNotes.setShouldConsumeEvents(false);
  PadNotes.setKeyTranslationTable(PadMIDITable.OFF);
  for (var x = 0; x < 16; x++) {
    for (var y = 0; y < 16; y++) {
      PadClipLauncher.updateClipLED(x, y);
    }
  }
}


PadClipLauncher.handleMIDI = function(data1, data2) {
  pressed = data2 > 0;
  var trackAdd = (activeClipBank - ClipBanks.Bank_A) * 4;
  if (pressed) {
    pressed = data2 > 0;
    var track = ((data1 - 36) % 4) + trackAdd;
    var clip = PadClipLauncher.getClipForMidiNote(data1);
    if (shifted) trackBank.getTrack(track).getClipLauncherSlots().stop();
    else trackBank.getTrack(track).getClipLauncherSlots().launch(clip);
  }
}


PadClipLauncher.clipContentObs = function(track, slot, hasContent) {
  PadMode.prototype.clipContentObs(track, slot, hasContent);
  this.updateClipLED(track, slot);
}


PadClipLauncher.clipRecordObs = function(track, slot, isRecording) {
  PadMode.prototype.clipRecordObs(track, slot, isRecording);
  this.updateClipLED(track, slot);
}


PadClipLauncher.clipPlayingObs = function(track, slot, isPlaying) {
  PadMode.prototype.clipPlayingObs(track, slot, isPlaying);
  this.updateClipLED(track, slot);
}


PadClipLauncher.getPadFromTrackSlot = function(track, slot, bank) {
  var Pad;
  var newslot;

  if (bank == ClipBanks.Bank_B) track -= 4;
  if (bank == ClipBanks.Bank_C) track -= 8;
  if (bank == ClipBanks.Bank_D) track -= 12;

  if (slot < 4) {
    newslot = Math.abs(slot - 3);
    Pad = track + (newslot * 4);
  } else if (slot < 8) {
    newslot = Math.abs(slot - 7) + 4;
    Pad = track + (newslot * 4);
  } else if (slot < 12) {
    newslot = Math.abs(slot - 11) + 8;
    Pad = track + (newslot * 4);
  } else {
    newslot = Math.abs(slot - 15) + 12;
    Pad = track + (newslot * 4);
  }
  return Pad;
}


PadClipLauncher.updateClipLED = function(track, slot) {
  if ((track < 4 && activeClipBank == ClipBanks.Bank_A) ||
      (track >= 4 && track < 8 && activeClipBank == ClipBanks.Bank_B) ||
      (track >= 8 && track < 12 && activeClipBank == ClipBanks.Bank_C) ||
      (track >= 12 && track < 15 && activeClipBank == ClipBanks.Bank_D)) {
    Pad = this.getPadFromTrackSlot(track, slot, activeClipBank);
    var clipData = clipSlots[track][slot];
    if (clipData.recording == true) lightPad(padColors['Red'], Pad, "Off");
    else if (clipData.playing == true) lightPad(padColors['Green'], Pad, "Off");
    else lightPad(clipData.color, Pad, "Off");
  }
}


PadClipLauncher.getClipForMidiNote = function(note) {
  note -= 36;
  if (note < 16) {
    return Math.abs(Math.floor(note / 4) - 3);
  } else if (note < 32) {
    note -= 16;
    return Math.abs(Math.floor(note / 4) - 3) + 4;
  } else if (note < 48) {
    note -= 32;
    return Math.abs(Math.floor(note / 4) - 3) + 8;
  } else if (note < 64) {
    note -= 48;
    return Math.abs(Math.floor(note / 4) - 3) + 12;
  }
}
