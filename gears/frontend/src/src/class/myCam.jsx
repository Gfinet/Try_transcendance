export function MyCam({source, title})
{
	return (
		<div style={col}>
			<p style={titleStyle}>{title}</p>
			<div style = {styles.cam}>
				<iframe src={source} style={styles.iframe} allow="autoplay"/>
			</div>
		</div>
	)
}
const titleStyle = {
    textAlign: 'center',
    marginTop: '10px',
    color: '#666',
};

const col = {
	display: 'flex', 
	flexDirection: 'column',
	width : '100%',
	height : '100%'
}

const styles = {
	cam : {
		position: 'relative', 
		width: '100%',
		aspectRatio: '16/9',
		boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
		overflow: 'hidden',
	},
	iframe: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		border: 'none'
	},
}