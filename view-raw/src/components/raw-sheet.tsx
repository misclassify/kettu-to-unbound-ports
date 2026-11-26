import { Discord } from '@unbound-app/api/metro/components';
import { messages } from '@unbound-app/i18n';
import { metro } from '@unbound-app/api';
import { TextInput, View, type TextStyle } from 'react-native';

type RawSheetProps = {
	json: string;
	content: string;
	onCopy: (value: string, message: string) => void;
	onClose: () => void;
};

const useStyles = Discord.createStyles(() => {
	const { Theme, Constants } = metro.common;

	return {
		container: { maxHeight: '85%', paddingHorizontal: 16, paddingBottom: 18, rowGap: 8 },
		code: {
			backgroundColor: Theme.colors?.BACKGROUND_CODE,
			borderColor: Theme.colors?.BORDER_SUBTLE,
			borderWidth: 1,
			borderRadius: Theme.radii?.sm,
			color: Theme.colors?.TEXT_DEFAULT,
			fontFamily: Constants.Fonts?.CODE_NORMAL,
			fontSize: 13,
			padding: 12,
			textAlignVertical: 'top',
		},
		content: { height: 96 },
		data: { maxHeight: 480 },
		heading: { marginTop: 8 },
		buttons: { flexDirection: 'row', columnGap: 8, marginTop: 8 },
		button: { flex: 1 },
	};
});

function CodeField({ value, style }: { value: string; style: TextStyle }) {
	const styles = useStyles();

	return (
		<TextInput
			multiline
			scrollEnabled
			selectTextOnFocus
			showSoftInputOnFocus={false}
			style={[styles.code, style]}
			value={value}
		/>
	);
}

function SheetButton({
	label,
	variant = 'secondary',
	disabled,
	onPress,
}: {
	label: string;
	variant?: 'primary' | 'secondary';
	disabled?: boolean;
	onPress: () => void;
}) {
	const styles = useStyles();

	return (
		<View style={styles.button}>
			<Discord.Button text={label} variant={variant} size='sm' disabled={disabled} onPress={onPress} />
		</View>
	);
}

/** The bottom sheet that shows a message's content and raw data, with buttons to copy each. */
function RawSheet({ json, content, onCopy, onClose }: RawSheetProps) {
	const styles = useStyles();

	return (
		<Discord.ActionSheet startExpanded>
			<Discord.BottomSheetTitleHeader title={messages.RAW_TITLE} />
			<View style={styles.container}>
				{content ? (
					<>
						<Discord.Text variant='text-sm/semibold' color='text-strong'>
							{messages.MESSAGE_CONTENT}
						</Discord.Text>
						<CodeField value={content} style={styles.content} />
						<Discord.Text variant='text-sm/semibold' color='text-strong' style={styles.heading}>
							{messages.MESSAGE_DATA}
						</Discord.Text>
					</>
				) : null}
				<CodeField value={json} style={styles.data} />
				<View style={styles.buttons}>
					<SheetButton
						label={messages.COPY_DATA}
						variant='primary'
						onPress={() => onCopy(json, messages.DATA_COPIED)}
					/>
					<SheetButton
						label={messages.COPY_CONTENT}
						disabled={!content}
						onPress={() => onCopy(content, messages.CONTENT_COPIED)}
					/>
					<SheetButton label={messages.CLOSE} onPress={onClose} />
				</View>
			</View>
		</Discord.ActionSheet>
	);
}

export default RawSheet;
