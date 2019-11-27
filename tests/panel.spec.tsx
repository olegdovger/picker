import React from 'react';
import MockDate from 'mockdate';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import { mount, getMoment, isSame, MomentPickerPanel } from './util/commonUtil';

describe('Panel', () => {
  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  describe('value', () => {
    it('defaultValue', () => {
      const wrapper = mount(
        <MomentPickerPanel defaultValue={getMoment('2000-01-01')} />,
      );

      expect(
        wrapper.find('.rc-picker-date-panel-cell-selected').text(),
      ).toEqual('1');
    });

    it('controlled', () => {
      const onChange = jest.fn();
      const wrapper = mount(
        <MomentPickerPanel
          value={getMoment('2000-01-01')}
          onChange={onChange}
        />,
      );

      wrapper.selectCell(23);
      expect(isSame(onChange.mock.calls[0][0], '2000-01-23')).toBeTruthy();
      onChange.mockReset();

      // Trigger again since value is controlled
      wrapper.selectCell(23);
      expect(isSame(onChange.mock.calls[0][0], '2000-01-23')).toBeTruthy();
      onChange.mockReset();

      // Not trigger
      wrapper.setProps({ value: getMoment('2000-01-23') });
      wrapper.selectCell(23);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('uncontrolled', () => {
      const onChange = jest.fn();
      const wrapper = mount(<MomentPickerPanel onChange={onChange} />);

      wrapper.selectCell(23);
      expect(isSame(onChange.mock.calls[0][0], '1990-09-23')).toBeTruthy();
      onChange.mockReset();

      // Not trigger
      wrapper.selectCell(23);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Panel switch by picker', () => {
    it('year', () => {
      const wrapper = mount(<MomentPickerPanel picker="year" />);
      wrapper.find('.rc-picker-year-panel-decade-btn').simulate('click');
      expect(wrapper.find('.rc-picker-decade-panel').length).toBeTruthy();

      wrapper.selectCell('1990-1999');
      expect(wrapper.find('.rc-picker-year-panel').length).toBeTruthy();

      wrapper.selectCell('1999');
      expect(wrapper.find('.rc-picker-year-panel').length).toBeTruthy();
    });

    it('month', () => {
      const wrapper = mount(<MomentPickerPanel picker="month" />);
      wrapper.find('.rc-picker-month-panel-year-btn').simulate('click');
      wrapper.find('.rc-picker-year-panel-decade-btn').simulate('click');
      expect(wrapper.find('.rc-picker-decade-panel').length).toBeTruthy();

      wrapper.selectCell('1990-1999');
      expect(wrapper.find('.rc-picker-year-panel').length).toBeTruthy();

      wrapper.selectCell('1999');
      expect(wrapper.find('.rc-picker-month-panel').length).toBeTruthy();

      wrapper.selectCell('Aug');
      expect(wrapper.find('.rc-picker-month-panel').length).toBeTruthy();
    });
  });

  describe('time click to scroll', () => {
    let domSpy: ReturnType<typeof spyElementPrototypes>;
    const requestAnimationFrameSpy = jest.spyOn(
      global,
      'requestAnimationFrame' as any,
    );

    beforeEach(() => {
      let scrollTop = 90;

      domSpy = spyElementPrototypes(HTMLElement, {
        scrollTop: {
          get: () => scrollTop,
          set: ((_: Function, value: number) => {
            scrollTop = value;
          }) as any,
        },
      });
    });
    afterEach(() => {
      domSpy.mockRestore();
    });

    it('scroll', () => {
      jest.useFakeTimers();
      const wrapper = mount(<MomentPickerPanel mode="time" />);

      // Multiple times should only one work
      wrapper
        .find('ul')
        .first()
        .find('li')
        .at(3)
        .simulate('click');

      wrapper
        .find('ul')
        .first()
        .find('li')
        .at(11)
        .simulate('click');
      jest.runAllTimers();

      expect(requestAnimationFrameSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});